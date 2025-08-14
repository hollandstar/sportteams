-- SportTeams - Progress DB Stored Procedures
-- Secure data access procedures with team-scoped security
-- Created: 2025-01-16

-- =============================================
-- SECURITY PROCEDURES
-- =============================================

-- Create or update user security context
CREATE PROCEDURE usp_update_security_context(
    IN p_user_id INTEGER,
    IN p_profile_id INTEGER,
    IN p_role VARCHAR(20),
    IN p_team_scopes CLOB,
    IN p_permissions CLOB
)
BEGIN
    -- Update or insert security context
    DECLARE v_count INTEGER DEFAULT 0;
    
    SELECT COUNT(*) INTO v_count 
    FROM user_security_contexts 
    WHERE user_id = p_user_id;
    
    IF v_count > 0 THEN
        UPDATE user_security_contexts 
        SET profile_id = p_profile_id,
            role = p_role,
            team_scopes = p_team_scopes,
            permissions = p_permissions,
            last_activity = CURRENT_TIMESTAMP
        WHERE user_id = p_user_id;
    ELSE
        INSERT INTO user_security_contexts (
            user_id, profile_id, role, team_scopes, permissions, last_activity
        ) VALUES (
            p_user_id, p_profile_id, p_role, p_team_scopes, p_permissions, CURRENT_TIMESTAMP
        );
    END IF;
END;

-- Validate user access to specific team
CREATE PROCEDURE usp_validate_team_access(
    IN p_user_id INTEGER,
    IN p_team_id INTEGER,
    OUT p_has_access BOOLEAN
)
BEGIN
    DECLARE v_team_scopes CLOB;
    DECLARE v_role VARCHAR(20);
    
    SET p_has_access = FALSE;
    
    -- Get user's team scopes and role
    SELECT team_scopes, role INTO v_team_scopes, v_role
    FROM user_security_contexts 
    WHERE user_id = p_user_id 
    AND expires_at > CURRENT_TIMESTAMP;
    
    -- Admin always has access
    IF v_role = 'admin' THEN
        SET p_has_access = TRUE;
    ELSEIF v_team_scopes IS NOT NULL THEN
        -- Check if team_id is in the JSON array (simplified check)
        IF POSITION(CAST(p_team_id AS VARCHAR) IN v_team_scopes) > 0 THEN
            SET p_has_access = TRUE;
        END IF;
    END IF;
END;

-- =============================================
-- PLAYER DATA PROCEDURES
-- =============================================

-- Get player data with security check
CREATE PROCEDURE usp_get_player_data(
    IN p_user_id INTEGER,
    IN p_player_id INTEGER,
    OUT p_result CLOB
)
BEGIN
    DECLARE v_player_team INTEGER;
    DECLARE v_has_access BOOLEAN DEFAULT FALSE;
    DECLARE v_user_role VARCHAR(20);
    
    -- Get player's team
    SELECT team_id INTO v_player_team 
    FROM players 
    WHERE id = p_player_id;
    
    -- Check access
    CALL usp_validate_team_access(p_user_id, v_player_team, v_has_access);
    
    -- Get user role for data filtering
    SELECT role INTO v_user_role
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF v_has_access THEN
        -- Build result based on role permissions
        IF v_user_role IN ('admin', 'coach', 'head_coach') THEN
            -- Full access for coaches and admins
            SELECT JSON_OBJECT(
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
                'recent_evaluations', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
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
                    LIMIT 5
                ),
                'active_goals', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', pg.id,
                            'title', pg.title,
                            'completion_percentage', pg.completion_percentage,
                            'target_date', pg.target_date
                        )
                    )
                    FROM player_goals pg 
                    WHERE pg.player_id = p.id 
                    AND pg.status = 'active'
                )
            ) INTO p_result
            FROM players p
            JOIN profiles pr ON p.profile_id = pr.id
            JOIN teams t ON p.team_id = t.id
            WHERE p.id = p_player_id;
            
        ELSE
            -- Limited access for players (only their own data)
            SELECT user_id FROM profiles WHERE id = (
                SELECT profile_id FROM players WHERE id = p_player_id
            ) INTO @player_user_id;
            
            IF @player_user_id = p_user_id THEN
                SELECT JSON_OBJECT(
                    'id', p.id,
                    'name', pr.name,
                    'position', p.position,
                    'jersey_number', p.jersey_number,
                    'team_name', t.name,
                    'my_evaluations', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'strong_points', pe.strong_points,
                                'improvement_points', pe.improvement_points,
                                'overall_rating', pe.overall_rating,
                                'created_at', pe.created_at
                            )
                        )
                        FROM player_evaluations pe 
                        WHERE pe.player_id = p.id
                        ORDER BY pe.created_at DESC
                        LIMIT 10
                    ),
                    'my_goals', (
                        SELECT JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'title', pg.title,
                                'description', pg.description,
                                'completion_percentage', pg.completion_percentage,
                                'target_date', pg.target_date
                            )
                        )
                        FROM player_goals pg 
                        WHERE pg.player_id = p.id
                    )
                ) INTO p_result
                FROM players p
                JOIN profiles pr ON p.profile_id = pr.id
                JOIN teams t ON p.team_id = t.id
                WHERE p.id = p_player_id;
            ELSE
                SET p_result = JSON_OBJECT('error', 'Access denied to player data');
            END IF;
        END IF;
    ELSE
        SET p_result = JSON_OBJECT('error', 'Access denied');
    END IF;
    
    -- Log access attempt
    INSERT INTO profile_access_logs (
        viewer_id, target_profile_id, access_type, resource_type, resource_id, timestamp
    ) VALUES (
        (SELECT profile_id FROM user_security_contexts WHERE user_id = p_user_id),
        (SELECT profile_id FROM players WHERE id = p_player_id),
        'view',
        'player',
        p_player_id,
        CURRENT_TIMESTAMP
    );
END;

-- Get team roster with security check
CREATE PROCEDURE usp_get_team_roster(
    IN p_user_id INTEGER,
    IN p_team_id INTEGER,
    OUT p_result CLOB
)
BEGIN
    DECLARE v_has_access BOOLEAN DEFAULT FALSE;
    DECLARE v_user_role VARCHAR(20);
    
    -- Check access
    CALL usp_validate_team_access(p_user_id, p_team_id, v_has_access);
    
    -- Get user role
    SELECT role INTO v_user_role
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF v_has_access THEN
        IF v_user_role IN ('admin', 'coach', 'head_coach') THEN
            -- Full roster data for coaches
            SELECT JSON_OBJECT(
                'team_info', JSON_OBJECT(
                    'id', t.id,
                    'name', t.name,
                    'category', t.category,
                    'season', t.season
                ),
                'players', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
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
                    WHERE p.team_id = p_team_id AND p.is_active = 1
                    ORDER BY p.jersey_number
                )
            ) INTO p_result
            FROM teams t
            WHERE t.id = p_team_id;
        ELSE
            -- Limited data for players
            SELECT JSON_OBJECT(
                'team_info', JSON_OBJECT(
                    'name', t.name,
                    'category', t.category
                ),
                'teammates', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'name', pr.name,
                            'jersey_number', p.jersey_number,
                            'position', p.position
                        )
                    )
                    FROM players p
                    JOIN profiles pr ON p.profile_id = pr.id
                    WHERE p.team_id = p_team_id AND p.is_active = 1
                    ORDER BY p.jersey_number
                )
            ) INTO p_result
            FROM teams t
            WHERE t.id = p_team_id;
        END IF;
    ELSE
        SET p_result = JSON_OBJECT('error', 'Access denied to team data');
    END IF;
END;

-- =============================================
-- EVALUATION PROCEDURES
-- =============================================

-- Create player evaluation with security check
CREATE PROCEDURE usp_create_evaluation(
    IN p_user_id INTEGER,
    IN p_player_id INTEGER,
    IN p_strong_points CLOB,
    IN p_improvement_points CLOB,
    IN p_coach_notes CLOB,
    IN p_overall_rating INTEGER,
    OUT p_evaluation_id INTEGER
)
BEGIN
    DECLARE v_player_team INTEGER;
    DECLARE v_has_access BOOLEAN DEFAULT FALSE;
    DECLARE v_evaluator_profile_id INTEGER;
    
    SET p_evaluation_id = 0;
    
    -- Get player's team
    SELECT team_id INTO v_player_team FROM players WHERE id = p_player_id;
    
    -- Check access
    CALL usp_validate_team_access(p_user_id, v_player_team, v_has_access);
    
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
        );
        
        SET p_evaluation_id = LAST_INSERT_ID();
        
        -- Log the action
        INSERT INTO profile_access_logs (
            viewer_id, target_profile_id, access_type, resource_type, resource_id
        ) VALUES (
            v_evaluator_profile_id,
            (SELECT profile_id FROM players WHERE id = p_player_id),
            'create_evaluation',
            'evaluation',
            p_evaluation_id
        );
    END IF;
END;

-- =============================================
-- TRANSLATION PROCEDURES
-- =============================================

-- Get translations by namespace and language
CREATE PROCEDURE usp_get_translations(
    IN p_namespace VARCHAR(50),
    IN p_language_code VARCHAR(5),
    OUT p_result CLOB
)
BEGIN
    SELECT JSON_OBJECTAGG(
        translation_key, value
    ) INTO p_result
    FROM translations 
    WHERE namespace = p_namespace 
    AND language_code = p_language_code;
    
    -- Fallback to default language if no translations found
    IF p_result IS NULL THEN
        SELECT JSON_OBJECTAGG(
            translation_key, value
        ) INTO p_result
        FROM translations 
        WHERE namespace = p_namespace 
        AND language_code = (
            SELECT code FROM languages WHERE is_default = TRUE LIMIT 1
        );
    END IF;
END;

-- =============================================
-- PERFORMANCE MONITORING PROCEDURES
-- =============================================

-- Get dashboard summary data
CREATE PROCEDURE usp_get_dashboard_summary(
    IN p_user_id INTEGER,
    OUT p_result CLOB
)
BEGIN
    DECLARE v_team_scopes CLOB;
    DECLARE v_role VARCHAR(20);
    
    -- Get user context
    SELECT team_scopes, role INTO v_team_scopes, v_role
    FROM user_security_contexts
    WHERE user_id = p_user_id;
    
    IF v_role = 'admin' THEN
        -- Admin dashboard - all data
        SELECT JSON_OBJECT(
            'total_teams', (SELECT COUNT(*) FROM teams WHERE is_active = 1),
            'total_players', (SELECT COUNT(*) FROM players WHERE is_active = 1),
            'recent_evaluations', (SELECT COUNT(*) FROM player_evaluations WHERE created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)),
            'pending_goals', (SELECT COUNT(*) FROM player_goals WHERE status = 'active' AND target_date <= DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY))
        ) INTO p_result;
        
    ELSEIF v_role IN ('coach', 'head_coach') THEN
        -- Coach dashboard - team-scoped data
        SELECT JSON_OBJECT(
            'my_teams', (
                SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'players_count', COALESCE(pc.cnt, 0)
                    )
                )
                FROM teams t
                LEFT JOIN (
                    SELECT team_id, COUNT(*) as cnt 
                    FROM players 
                    WHERE is_active = 1 
                    GROUP BY team_id
                ) pc ON pc.team_id = t.id
                WHERE POSITION(CAST(t.id AS VARCHAR) IN v_team_scopes) > 0
            ),
            'recent_evaluations', (
                SELECT COUNT(*) 
                FROM player_evaluations pe
                JOIN players p ON pe.player_id = p.id
                WHERE pe.created_at >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
                AND POSITION(CAST(p.team_id AS VARCHAR) IN v_team_scopes) > 0
            )
        ) INTO p_result;
        
    ELSE
        -- Player dashboard - personal data only
        SELECT JSON_OBJECT(
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
        ) INTO p_result;
    END IF;
END;

-- =============================================
-- COMPLETION NOTES
-- =============================================

-- These stored procedures provide:
-- 1. Secure data access with team-scoped permissions
-- 2. Role-based data filtering
-- 3. Comprehensive audit logging
-- 4. Performance-optimized queries
-- 5. JSON result formatting for API consumption

-- Next Steps:
-- 1. Test all procedures with sample data
-- 2. Create Laravel service classes that call these procedures
-- 3. Implement connection pooling in PHP
-- 4. Add caching layer for frequently accessed data