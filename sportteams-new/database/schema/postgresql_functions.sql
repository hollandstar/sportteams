-- SportTeams - PostgreSQL Functions
-- Secure data access functions with team-scoped security
-- Created: 2025-01-16

-- =============================================
-- SECURITY FUNCTIONS
-- =============================================

-- Function to update or create user security context
CREATE OR REPLACE FUNCTION usp_update_security_context(
    p_user_id INTEGER,
    p_profile_id INTEGER,
    p_role VARCHAR(20),
    p_team_scopes JSONB,
    p_permissions JSONB
) RETURNS VOID AS $$
BEGIN
    -- Update or insert security context
    INSERT INTO user_security_contexts (
        user_id, profile_id, role, team_scopes, permissions, last_activity, expires_at
    ) VALUES (
        p_user_id, p_profile_id, p_role, p_team_scopes, p_permissions, 
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '8 hours'
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        profile_id = p_profile_id,
        role = p_role,
        team_scopes = p_team_scopes,
        permissions = p_permissions,
        last_activity = CURRENT_TIMESTAMP,
        expires_at = CURRENT_TIMESTAMP + INTERVAL '8 hours';
END;
$$ LANGUAGE plpgsql;

-- Function to validate user access to specific team
CREATE OR REPLACE FUNCTION usp_validate_team_access(
    p_user_id INTEGER,
    p_team_id INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
    v_team_scopes JSONB;
    v_role VARCHAR(20);
    v_has_access BOOLEAN := FALSE;
BEGIN
    -- Get user's team scopes and role
    SELECT team_scopes, role INTO v_team_scopes, v_role
    FROM user_security_contexts 
    WHERE user_id = p_user_id 
    AND expires_at > CURRENT_TIMESTAMP;
    
    -- Admin always has access
    IF v_role = 'admin' THEN
        RETURN TRUE;
    END IF;
    
    -- Check if team_id is in the JSON array
    IF v_team_scopes IS NOT NULL AND jsonb_exists(v_team_scopes, p_team_id::text) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- PLAYER DATA FUNCTIONS
-- =============================================

-- Get player data with security check
CREATE OR REPLACE FUNCTION usp_get_player_data(
    p_user_id INTEGER,
    p_player_id INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_player_team INTEGER;
    v_has_access BOOLEAN := FALSE;
    v_user_role VARCHAR(20);
    v_result JSONB;
    v_evaluator_profile_id INTEGER;
BEGIN
    -- Get player's team
    SELECT team_id INTO v_player_team FROM players WHERE id = p_player_id;
    
    -- Check access
    SELECT usp_validate_team_access(p_user_id, v_player_team) INTO v_has_access;
    
    -- Get user role and profile
    SELECT role, profile_id INTO v_user_role, v_evaluator_profile_id
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF NOT v_has_access THEN
        RETURN jsonb_build_object('error', 'Access denied');
    END IF;
    
    -- Build result based on role permissions
    IF v_user_role IN ('admin', 'coach', 'head_coach') THEN
        -- Full access for coaches and admins
        SELECT jsonb_build_object(
            'id', p.id,
            'name', pr.name,
            'email', pr.email,
            'phone', pr.phone,
            'position', p.position,
            'jersey_number', p.jersey_number,
            'date_of_birth', p.date_of_birth,
            'height', p.height,
            'weight', p.weight,
            'dominant_hand', p.dominant_hand,
            'team_name', t.name,
            'recent_evaluations', COALESCE(
                (SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', pe.id,
                        'strong_points', pe.strong_points,
                        'improvement_points', pe.improvement_points,
                        'overall_rating', pe.overall_rating,
                        'created_at', pe.created_at
                    )
                )
                FROM player_evaluations pe 
                WHERE pe.player_id = p.id 
                ORDER BY pe.created_at DESC 
                LIMIT 5), '[]'::jsonb
            ),
            'active_goals', COALESCE(
                (SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', pg.id,
                        'title', pg.title,
                        'completion_percentage', pg.completion_percentage,
                        'target_date', pg.target_date
                    )
                )
                FROM player_goals pg 
                WHERE pg.player_id = p.id 
                AND pg.status = 'active'), '[]'::jsonb
            )
        ) INTO v_result
        FROM players p
        JOIN profiles pr ON p.profile_id = pr.id
        JOIN teams t ON p.team_id = t.id
        WHERE p.id = p_player_id;
        
    ELSE
        -- Limited access for players (only their own data)
        IF EXISTS (
            SELECT 1 FROM players pl 
            JOIN profiles pr ON pl.profile_id = pr.id 
            WHERE pl.id = p_player_id AND pr.user_id = p_user_id
        ) THEN
            SELECT jsonb_build_object(
                'id', p.id,
                'name', pr.name,
                'position', p.position,
                'jersey_number', p.jersey_number,
                'team_name', t.name,
                'my_evaluations', COALESCE(
                    (SELECT jsonb_agg(
                        jsonb_build_object(
                            'strong_points', pe.strong_points,
                            'improvement_points', pe.improvement_points,
                            'overall_rating', pe.overall_rating,
                            'created_at', pe.created_at
                        )
                    )
                    FROM player_evaluations pe 
                    WHERE pe.player_id = p.id
                    ORDER BY pe.created_at DESC
                    LIMIT 10), '[]'::jsonb
                ),
                'my_goals', COALESCE(
                    (SELECT jsonb_agg(
                        jsonb_build_object(
                            'title', pg.title,
                            'description', pg.description,
                            'completion_percentage', pg.completion_percentage,
                            'target_date', pg.target_date
                        )
                    )
                    FROM player_goals pg 
                    WHERE pg.player_id = p.id), '[]'::jsonb
                )
            ) INTO v_result
            FROM players p
            JOIN profiles pr ON p.profile_id = pr.id
            JOIN teams t ON p.team_id = t.id
            WHERE p.id = p_player_id;
        ELSE
            RETURN jsonb_build_object('error', 'Access denied to player data');
        END IF;
    END IF;
    
    -- Log access attempt
    INSERT INTO profile_access_logs (
        viewer_id, target_profile_id, access_type, resource_type, resource_id, timestamp
    ) VALUES (
        v_evaluator_profile_id,
        (SELECT profile_id FROM players WHERE id = p_player_id),
        'view',
        'player',
        p_player_id,
        CURRENT_TIMESTAMP
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Get team roster with security check
CREATE OR REPLACE FUNCTION usp_get_team_roster(
    p_user_id INTEGER,
    p_team_id INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_has_access BOOLEAN := FALSE;
    v_user_role VARCHAR(20);
    v_result JSONB;
BEGIN
    -- Check access
    SELECT usp_validate_team_access(p_user_id, p_team_id) INTO v_has_access;
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF NOT v_has_access THEN
        RETURN jsonb_build_object('error', 'Access denied to team data');
    END IF;
    
    IF v_user_role IN ('admin', 'coach', 'head_coach') THEN
        -- Full roster data for coaches
        SELECT jsonb_build_object(
            'team_info', jsonb_build_object(
                'id', t.id,
                'name', t.name,
                'category', t.category,
                'season', t.season
            ),
            'players', COALESCE(
                (SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', p.id,
                        'name', pr.name,
                        'jersey_number', p.jersey_number,
                        'position', p.position,
                        'evaluations_count', COALESCE(eval_count.cnt, 0),
                        'avg_score', COALESCE(avg_scores.avg_score, 0),
                        'active_goals', COALESCE(goal_count.cnt, 0)
                    )
                )
                FROM players p
                JOIN profiles pr ON p.profile_id = pr.id
                LEFT JOIN (
                    SELECT player_id, COUNT(*) as cnt 
                    FROM player_evaluations 
                    GROUP BY player_id
                ) eval_count ON eval_count.player_id = p.id
                LEFT JOIN (
                    SELECT player_profile_id, AVG(score) as avg_score 
                    FROM test_results 
                    GROUP BY player_profile_id
                ) avg_scores ON avg_scores.player_profile_id = p.profile_id
                LEFT JOIN (
                    SELECT player_id, COUNT(*) as cnt 
                    FROM player_goals 
                    WHERE status = 'active' 
                    GROUP BY player_id
                ) goal_count ON goal_count.player_id = p.id
                WHERE p.team_id = p_team_id AND p.is_active = true
                ORDER BY p.jersey_number), '[]'::jsonb
            )
        ) INTO v_result
        FROM teams t
        WHERE t.id = p_team_id;
    ELSE
        -- Limited data for players
        SELECT jsonb_build_object(
            'team_info', jsonb_build_object(
                'name', t.name,
                'category', t.category
            ),
            'teammates', COALESCE(
                (SELECT jsonb_agg(
                    jsonb_build_object(
                        'name', pr.name,
                        'jersey_number', p.jersey_number,
                        'position', p.position
                    )
                )
                FROM players p
                JOIN profiles pr ON p.profile_id = pr.id
                WHERE p.team_id = p_team_id AND p.is_active = true
                ORDER BY p.jersey_number), '[]'::jsonb
            )
        ) INTO v_result
        FROM teams t
        WHERE t.id = p_team_id;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- EVALUATION FUNCTIONS
-- =============================================

-- Create player evaluation with security check
CREATE OR REPLACE FUNCTION usp_create_evaluation(
    p_user_id INTEGER,
    p_player_id INTEGER,
    p_strong_points TEXT,
    p_improvement_points TEXT,
    p_coach_notes TEXT,
    p_overall_rating INTEGER
) RETURNS INTEGER AS $$
DECLARE
    v_player_team INTEGER;
    v_has_access BOOLEAN := FALSE;
    v_evaluator_profile_id INTEGER;
    v_evaluation_id INTEGER := 0;
BEGIN
    -- Get player's team
    SELECT team_id INTO v_player_team FROM players WHERE id = p_player_id;
    
    -- Check access
    SELECT usp_validate_team_access(p_user_id, v_player_team) INTO v_has_access;
    
    -- Get evaluator profile ID
    SELECT profile_id INTO v_evaluator_profile_id 
    FROM user_security_contexts 
    WHERE user_id = p_user_id;
    
    IF v_has_access THEN
        INSERT INTO player_evaluations (
            player_id,
            evaluator_profile_id,
            strong_points,
            improvement_points,
            coach_notes,
            overall_rating,
            created_at
        ) VALUES (
            p_player_id,
            v_evaluator_profile_id,
            p_strong_points,
            p_improvement_points,
            p_coach_notes,
            p_overall_rating,
            CURRENT_TIMESTAMP
        ) RETURNING id INTO v_evaluation_id;
        
        -- Log the action
        INSERT INTO profile_access_logs (
            viewer_id, target_profile_id, access_type, resource_type, resource_id
        ) VALUES (
            v_evaluator_profile_id,
            (SELECT profile_id FROM players WHERE id = p_player_id),
            'create_evaluation',
            'evaluation',
            v_evaluation_id
        );
    END IF;
    
    RETURN v_evaluation_id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRANSLATION FUNCTIONS
-- =============================================

-- Get translations by namespace and language
CREATE OR REPLACE FUNCTION usp_get_translations(
    p_namespace VARCHAR(50),
    p_language_code VARCHAR(5)
) RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_object_agg(translation_key, value) INTO v_result
    FROM translations 
    WHERE namespace = p_namespace 
    AND language_code = p_language_code;
    
    -- Fallback to default language if no translations found
    IF v_result IS NULL THEN
        SELECT jsonb_object_agg(translation_key, value) INTO v_result
        FROM translations 
        WHERE namespace = p_namespace 
        AND language_code = (
            SELECT code FROM languages WHERE is_default = TRUE LIMIT 1
        );
    END IF;
    
    RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DASHBOARD FUNCTIONS
-- =============================================

-- Get dashboard summary data
CREATE OR REPLACE FUNCTION usp_get_dashboard_summary(
    p_user_id INTEGER
) RETURNS JSONB AS $$
DECLARE
    v_team_scopes JSONB;
    v_role VARCHAR(20);
    v_result JSONB;
BEGIN
    -- Get user context
    SELECT team_scopes, role INTO v_team_scopes, v_role
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF v_role = 'admin' THEN
        -- Admin dashboard - all data
        SELECT jsonb_build_object(
            'total_teams', (SELECT COUNT(*) FROM teams WHERE is_active = true),
            'total_players', (SELECT COUNT(*) FROM players WHERE is_active = true),
            'recent_evaluations', (SELECT COUNT(*) FROM player_evaluations WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'),
            'pending_goals', (SELECT COUNT(*) FROM player_goals WHERE status = 'active' AND target_date <= CURRENT_DATE + INTERVAL '30 days')
        ) INTO v_result;
        
    ELSIF v_role IN ('coach', 'head_coach') THEN
        -- Coach dashboard - team-scoped data
        SELECT jsonb_build_object(
            'my_teams', COALESCE(
                (SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', t.id,
                        'name', t.name,
                        'players_count', COALESCE(pc.cnt, 0)
                    )
                )
                FROM teams t
                LEFT JOIN (
                    SELECT team_id, COUNT(*) as cnt 
                    FROM players 
                    WHERE is_active = true 
                    GROUP BY team_id
                ) pc ON pc.team_id = t.id
                WHERE t.id::text = ANY(SELECT jsonb_array_elements_text(v_team_scopes))), '[]'::jsonb
            ),
            'recent_evaluations', (
                SELECT COUNT(*) 
                FROM player_evaluations pe
                JOIN players p ON pe.player_id = p.id
                WHERE pe.created_at >= CURRENT_DATE - INTERVAL '7 days'
                AND p.team_id::text = ANY(SELECT jsonb_array_elements_text(v_team_scopes))
            )
        ) INTO v_result;
        
    ELSE
        -- Player dashboard - personal data only
        SELECT jsonb_build_object(
            'my_evaluations_count', (
                SELECT COUNT(*) 
                FROM player_evaluations pe
                JOIN players p ON pe.player_id = p.id
                JOIN profiles pr ON p.profile_id = pr.id
                WHERE pr.user_id = p_user_id
            ),
            'my_goals_count', (
                SELECT COUNT(*) 
                FROM player_goals pg
                JOIN players p ON pg.player_id = p.id
                JOIN profiles pr ON p.profile_id = pr.id
                WHERE pr.user_id = p_user_id AND pg.status = 'active'
            )
        ) INTO v_result;
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

SELECT 'SportTeams PostgreSQL functions created successfully!' as message;