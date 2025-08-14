#!/usr/bin/env python3
"""
SportTeams Laravel Backend API Test Suite - Forms API Testing
Tests the new Forms API system implementation
"""

import requests
import json
import time
import sys
from typing import Dict, Any, Optional

class SportTeamsBackendTester:
    def __init__(self):
        # Use the correct backend URL - Laravel is running on port 8001
        self.base_url = "http://localhost:8001/api/v1"
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.test_results = []
        self.created_form_template_id = None
        
        # Test credentials from the review request
        self.test_credentials = {
            "email": "admin@sportteams.nl",
            "password": "admin123"
        }
        
    def ensure_valid_token(self) -> bool:
        """Ensure we have a valid access token, refresh if needed"""
        if not self.access_token or not self.refresh_token:
            return False
            
        try:
            # Test current token
            headers = {'Authorization': f'Bearer {self.access_token}'}
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers, timeout=5)
            
            if response.status_code == 200:
                return True  # Token is still valid
            
            # Token expired, try to refresh
            if self.refresh_token:
                refresh_response = self.session.post(
                    f"{self.base_url}/auth/refresh",
                    json={"refresh_token": self.refresh_token},
                    timeout=10
                )
                
                if refresh_response.status_code == 200:
                    data = refresh_response.json()
                    if data.get('status') == 'success' and 'tokens' in data:
                        self.access_token = data['tokens']['access_token']
                        self.refresh_token = data['tokens']['refresh_token']
                        return True
            
            return False
            
        except:
            return False
        
    def log_result(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2)}")
        print()

    def test_basic_connection(self) -> bool:
        """Test basic connection to the test endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/test", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    self.log_result(
                        "Basic Connection Test",
                        True,
                        "Successfully connected to /api/v1/test endpoint",
                        {
                            "status_code": response.status_code,
                            "response_data": data,
                            "database_tables": data.get('data', {}).get('tables_count', 'unknown')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Basic Connection Test",
                        False,
                        f"Unexpected response status: {data.get('status')}",
                        {"response": data}
                    )
                    return False
            else:
                self.log_result(
                    "Basic Connection Test",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Basic Connection Test",
                False,
                f"Connection failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_cors_configuration(self) -> bool:
        """Test CORS configuration"""
        try:
            # Test preflight request
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type,Authorization'
            }
            
            response = self.session.options(f"{self.base_url}/test", headers=headers, timeout=10)
            
            cors_headers = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
            }
            
            # Check if CORS allows frontend requests
            allows_origin = cors_headers['Access-Control-Allow-Origin'] in ['*', 'http://localhost:3000']
            allows_methods = 'POST' in (cors_headers['Access-Control-Allow-Methods'] or '')
            allows_headers = 'authorization' in (cors_headers['Access-Control-Allow-Headers'] or '').lower()
            
            cors_working = allows_origin and (allows_methods or response.status_code == 200)
            
            self.log_result(
                "CORS Configuration Test",
                cors_working,
                "CORS properly configured for frontend requests" if cors_working else "CORS configuration issues detected",
                {
                    "status_code": response.status_code,
                    "cors_headers": cors_headers,
                    "allows_origin": allows_origin,
                    "allows_methods": allows_methods,
                    "allows_headers": allows_headers
                }
            )
            return cors_working
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "CORS Configuration Test",
                False,
                f"CORS test failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_authentication_login(self) -> bool:
        """Test authentication login endpoint"""
        try:
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=self.test_credentials,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and 'tokens' in data:
                    self.access_token = data['tokens']['access_token']
                    self.refresh_token = data['tokens']['refresh_token']
                    
                    self.log_result(
                        "Authentication Login Test",
                        True,
                        "Successfully authenticated with test credentials",
                        {
                            "status_code": response.status_code,
                            "user_data": data.get('user', {}),
                            "token_type": data['tokens'].get('token_type'),
                            "expires_in": data['tokens'].get('expires_in')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Authentication Login Test",
                        False,
                        f"Login failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Authentication Login Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Authentication Login Test",
                False,
                f"Login request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_jwt_token_validation(self) -> bool:
        """Test JWT token validation with protected endpoint"""
        if not self.access_token:
            self.log_result(
                "JWT Token Validation Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and 'user' in data:
                    self.log_result(
                        "JWT Token Validation Test",
                        True,
                        "JWT token successfully validated",
                        {
                            "status_code": response.status_code,
                            "user_data": data.get('user', {}),
                            "token_working": True
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "JWT Token Validation Test",
                        False,
                        f"Token validation failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "JWT Token Validation Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "JWT Token Validation Test",
                False,
                f"Token validation request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_security_middleware(self) -> bool:
        """Test SecurityMiddleware functionality"""
        try:
            # Test without token (should fail)
            response = self.session.get(f"{self.base_url}/auth/me", timeout=10)
            
            if response.status_code == 401:
                unauthorized_success = True
                unauthorized_message = "Correctly rejected request without token"
            else:
                unauthorized_success = False
                unauthorized_message = f"Expected 401, got {response.status_code}"
            
            # Test with invalid token (should fail)
            headers = {'Authorization': 'Bearer invalid_token_here'}
            response = self.session.get(f"{self.base_url}/auth/me", headers=headers, timeout=10)
            
            if response.status_code == 401:
                invalid_token_success = True
                invalid_token_message = "Correctly rejected invalid token"
            else:
                invalid_token_success = False
                invalid_token_message = f"Expected 401 for invalid token, got {response.status_code}"
            
            overall_success = unauthorized_success and invalid_token_success
            
            self.log_result(
                "Security Middleware Test",
                overall_success,
                "Security middleware working correctly" if overall_success else "Security middleware issues detected",
                {
                    "no_token_test": {
                        "success": unauthorized_success,
                        "message": unauthorized_message
                    },
                    "invalid_token_test": {
                        "success": invalid_token_success,
                        "message": invalid_token_message
                    }
                }
            )
            return overall_success
            
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Security Middleware Test",
                False,
                f"Security middleware test failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_token_refresh(self) -> bool:
        """Test JWT token refresh functionality"""
        if not self.refresh_token:
            self.log_result(
                "Token Refresh Test",
                False,
                "No refresh token available - login test must pass first",
                {}
            )
            return False
            
        try:
            response = self.session.post(
                f"{self.base_url}/auth/refresh",
                json={"refresh_token": self.refresh_token},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and 'tokens' in data:
                    # Update tokens
                    old_access_token = self.access_token
                    self.access_token = data['tokens']['access_token']
                    self.refresh_token = data['tokens']['refresh_token']
                    
                    self.log_result(
                        "Token Refresh Test",
                        True,
                        "Successfully refreshed JWT tokens",
                        {
                            "status_code": response.status_code,
                            "new_tokens_received": True,
                            "tokens_different": old_access_token != self.access_token
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Token Refresh Test",
                        False,
                        f"Token refresh failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Token Refresh Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Token Refresh Test",
                False,
                f"Token refresh request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_database_connection(self) -> bool:
        """Test database connection through the test endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/test", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and 'data' in data:
                    db_data = data['data']
                    tables_count = db_data.get('tables_count', 0)
                    
                    # Check if we have a reasonable number of tables
                    db_working = isinstance(tables_count, (int, str)) and int(tables_count) > 0
                    
                    self.log_result(
                        "Database Connection Test",
                        db_working,
                        f"Database connection {'working' if db_working else 'failed'} - {tables_count} tables found",
                        {
                            "database": db_data.get('database'),
                            "tables_count": tables_count,
                            "timestamp": db_data.get('timestamp'),
                            "security_enhanced": db_data.get('security_enhanced')
                        }
                    )
                    return db_working
                else:
                    self.log_result(
                        "Database Connection Test",
                        False,
                        f"Database test failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                self.log_result(
                    "Database Connection Test",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Database Connection Test",
                False,
                f"Database connection test failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_logout_functionality(self) -> bool:
        """Test logout functionality"""
        if not self.access_token:
            self.log_result(
                "Logout Functionality Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/logout",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    self.log_result(
                        "Logout Functionality Test",
                        True,
                        "Successfully logged out",
                        {
                            "status_code": response.status_code,
                            "message": data.get('message')
                        }
                    )
                    
                    # Clear tokens
                    self.access_token = None
                    self.refresh_token = None
                    return True
                else:
                    self.log_result(
                        "Logout Functionality Test",
                        False,
                        f"Logout failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Logout Functionality Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Logout Functionality Test",
                False,
                f"Logout request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_team_admin_database_schema(self) -> bool:
        """Test Team Admin database schema and helper functions"""
        if not self.access_token:
            self.log_result(
                "Team Admin Database Schema Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Test database connection and table count
            response = self.session.get(f"{self.base_url}/test", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                tables_count = data.get('data', {}).get('tables_count', 0)
                
                # Check if we have the expected tables (should be 20+ with team admin tables)
                schema_working = int(tables_count) >= 20
                
                self.log_result(
                    "Team Admin Database Schema Test",
                    schema_working,
                    f"Database schema {'verified' if schema_working else 'incomplete'} - {tables_count} tables found",
                    {
                        "tables_count": tables_count,
                        "expected_minimum": 20,
                        "includes_team_admin_tables": schema_working
                    }
                )
                return schema_working
            else:
                self.log_result(
                    "Team Admin Database Schema Test",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Team Admin Database Schema Test",
                False,
                f"Schema test failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_team_admin_get_managed_teams(self) -> bool:
        """Test GET /api/v1/team-admin/teams endpoint"""
        if not self.access_token:
            self.log_result(
                "Team Admin Get Managed Teams Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/team-admin/teams",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    teams = data.get('data', {}).get('teams', [])
                    self.log_result(
                        "Team Admin Get Managed Teams Test",
                        True,
                        f"Successfully retrieved managed teams - {len(teams)} teams found",
                        {
                            "status_code": response.status_code,
                            "teams_count": len(teams),
                            "teams_data": teams[:2] if teams else []  # Show first 2 teams
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Team Admin Get Managed Teams Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Team Admin Get Managed Teams Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Team Admin Get Managed Teams Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_team_admin_get_team_players(self) -> bool:
        """Test GET /api/v1/team-admin/teams/{teamId}/players endpoint"""
        if not self.access_token:
            self.log_result(
                "Team Admin Get Team Players Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # First get managed teams to get a valid team ID
            teams_response = self.session.get(
                f"{self.base_url}/team-admin/teams",
                headers=headers,
                timeout=10
            )
            
            if teams_response.status_code != 200:
                self.log_result(
                    "Team Admin Get Team Players Test",
                    False,
                    "Could not retrieve managed teams to test with",
                    {"teams_response_status": teams_response.status_code}
                )
                return False
            
            teams_data = teams_response.json()
            teams = teams_data.get('data', {}).get('teams', [])
            
            if not teams:
                self.log_result(
                    "Team Admin Get Team Players Test",
                    True,  # Not a failure - just no teams to test with
                    "No managed teams available to test team players endpoint",
                    {"teams_count": 0}
                )
                return True
            
            # Test with first available team
            test_team_id = teams[0]['id']
            response = self.session.get(
                f"{self.base_url}/team-admin/teams/{test_team_id}/players",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    players = data.get('data', {}).get('players', [])
                    self.log_result(
                        "Team Admin Get Team Players Test",
                        True,
                        f"Successfully retrieved team players - {len(players)} players found",
                        {
                            "status_code": response.status_code,
                            "team_id": test_team_id,
                            "players_count": len(players),
                            "players_data": players[:2] if players else []  # Show first 2 players
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Team Admin Get Team Players Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Team Admin Get Team Players Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Team Admin Get Team Players Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_team_admin_create_player(self) -> bool:
        """Test POST /api/v1/team-admin/players endpoint"""
        if not self.access_token:
            self.log_result(
                "Team Admin Create Player Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # First get managed teams to get a valid team ID
            teams_response = self.session.get(
                f"{self.base_url}/team-admin/teams",
                headers=headers,
                timeout=10
            )
            
            if teams_response.status_code != 200:
                self.log_result(
                    "Team Admin Create Player Test",
                    False,
                    "Could not retrieve managed teams to test with",
                    {"teams_response_status": teams_response.status_code}
                )
                return False
            
            teams_data = teams_response.json()
            teams = teams_data.get('data', {}).get('teams', [])
            
            if not teams:
                self.log_result(
                    "Team Admin Create Player Test",
                    True,  # Not a failure - just no teams to test with
                    "No managed teams available to test create player endpoint",
                    {"teams_count": 0}
                )
                return True
            
            # Test creating a new player
            test_team_id = teams[0]['id']
            import time
            unique_id = int(time.time())
            
            player_data = {
                "team_id": test_team_id,
                "name": f"Test Player {unique_id}",
                "email": f"testplayer{unique_id}@sportteams.nl",
                "birth_date": "1995-06-15",
                "position": "Forward",
                "jersey_number": 10
            }
            
            response = self.session.post(
                f"{self.base_url}/team-admin/players",
                json=player_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('status') == 'success':
                    self.log_result(
                        "Team Admin Create Player Test",
                        True,
                        "Successfully created new player",
                        {
                            "status_code": response.status_code,
                            "team_id": test_team_id,
                            "player_data": player_data,
                            "response_data": data.get('data', {})
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Team Admin Create Player Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Team Admin Create Player Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data,
                        "player_data": player_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Team Admin Create Player Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_team_admin_audit_log(self) -> bool:
        """Test GET /api/v1/team-admin/audit-log endpoint"""
        if not self.access_token:
            self.log_result(
                "Team Admin Audit Log Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/team-admin/audit-log",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    audit_log = data.get('data', {}).get('audit_log', [])
                    self.log_result(
                        "Team Admin Audit Log Test",
                        True,
                        f"Successfully retrieved audit log - {len(audit_log)} entries found",
                        {
                            "status_code": response.status_code,
                            "audit_entries_count": len(audit_log),
                            "sample_entries": audit_log[:2] if audit_log else []  # Show first 2 entries
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Team Admin Audit Log Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Team Admin Audit Log Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Team Admin Audit Log Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_templates_get_all(self) -> bool:
        """Test GET /api/v1/forms/templates endpoint (Admin-only)"""
        if not self.ensure_valid_token():
            self.log_result(
                "Forms Templates Get All Test",
                False,
                "No valid access token available - authentication failed",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/forms/templates",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    templates = data.get('data', [])
                    self.log_result(
                        "Forms Templates Get All Test",
                        True,
                        f"Successfully retrieved form templates - {len(templates)} templates found",
                        {
                            "status_code": response.status_code,
                            "templates_count": len(templates),
                            "sample_templates": templates[:2] if templates else []
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Templates Get All Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Templates Get All Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Templates Get All Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_templates_create(self) -> bool:
        """Test POST /api/v1/forms/templates endpoint (Admin-only)"""
        if not self.ensure_valid_token():
            self.log_result(
                "Forms Templates Create Test",
                False,
                "No valid access token available - authentication failed",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # Create a condition test form template
            unique_id = int(time.time())
            template_data = {
                "name": f"Test Condition Form {unique_id}",
                "type": "condition_test",
                "description": "Test condition assessment form for API testing",
                "fields_config": {
                    "test_type": {
                        "type": "select",
                        "label": "Test Type",
                        "options": ["30-15 IFT", "Yo-Yo Test", "Cooper Test"],
                        "required": True
                    },
                    "test_date": {
                        "type": "date",
                        "label": "Test Date",
                        "required": True
                    },
                    "results": {
                        "type": "number",
                        "label": "Test Results",
                        "required": True
                    }
                },
                "is_active": True
            }
            
            response = self.session.post(
                f"{self.base_url}/forms/templates",
                json=template_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('status') == 'success':
                    created_template = data.get('data', {})
                    self.created_form_template_id = created_template.get('id')
                    
                    self.log_result(
                        "Forms Templates Create Test",
                        True,
                        "Successfully created new form template",
                        {
                            "status_code": response.status_code,
                            "template_id": self.created_form_template_id,
                            "template_name": created_template.get('name'),
                            "template_type": created_template.get('type'),
                            "is_active": created_template.get('is_active')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Templates Create Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Templates Create Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data,
                        "template_data": template_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Templates Create Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_active_get(self) -> bool:
        """Test GET /api/v1/forms/active endpoint (accessible by all users)"""
        if not self.access_token:
            self.log_result(
                "Forms Active Get Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/forms/active",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    active_forms = data.get('data', [])
                    self.log_result(
                        "Forms Active Get Test",
                        True,
                        f"Successfully retrieved active forms - {len(active_forms)} active forms found",
                        {
                            "status_code": response.status_code,
                            "active_forms_count": len(active_forms),
                            "sample_forms": active_forms[:2] if active_forms else []
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Active Get Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Active Get Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Active Get Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_template_toggle_active(self) -> bool:
        """Test POST /api/v1/forms/templates/{id}/toggle-active endpoint (Admin-only)"""
        if not self.access_token:
            self.log_result(
                "Forms Template Toggle Active Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        if not self.created_form_template_id:
            self.log_result(
                "Forms Template Toggle Active Test",
                False,
                "No form template ID available - create template test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.post(
                f"{self.base_url}/forms/templates/{self.created_form_template_id}/toggle-active",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    updated_template = data.get('data', {})
                    self.log_result(
                        "Forms Template Toggle Active Test",
                        True,
                        f"Successfully toggled form active status - now {'active' if updated_template.get('is_active') else 'inactive'}",
                        {
                            "status_code": response.status_code,
                            "template_id": self.created_form_template_id,
                            "is_active": updated_template.get('is_active'),
                            "message": data.get('message')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Template Toggle Active Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Template Toggle Active Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Template Toggle Active Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_statistics_get(self) -> bool:
        """Test GET /api/v1/forms/statistics endpoint (Admin-only)"""
        if not self.access_token:
            self.log_result(
                "Forms Statistics Get Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/forms/statistics",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    stats = data.get('data', {})
                    self.log_result(
                        "Forms Statistics Get Test",
                        True,
                        "Successfully retrieved form statistics",
                        {
                            "status_code": response.status_code,
                            "total_forms": stats.get('total_forms'),
                            "active_forms": stats.get('active_forms'),
                            "condition_test_responses": stats.get('condition_test_responses'),
                            "action_type_test_responses": stats.get('action_type_test_responses'),
                            "skill_assessment_responses": stats.get('skill_assessment_responses')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Statistics Get Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Statistics Get Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Statistics Get Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_responses_submit(self) -> bool:
        """Test POST /api/v1/forms/responses endpoint"""
        if not self.access_token:
            self.log_result(
                "Forms Responses Submit Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        if not self.created_form_template_id:
            self.log_result(
                "Forms Responses Submit Test",
                False,
                "No form template ID available - create template test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            # First, get a valid player and team ID from the database
            # For testing, we'll use the admin user as both player and submitter
            # In a real scenario, these would be different users
            response_data = {
                "form_template_id": self.created_form_template_id,
                "player_id": 1,  # Assuming admin user has ID 1
                "team_id": 1,    # Assuming there's a team with ID 1
                "responses": {
                    "test_type": "30-15 IFT",
                    "test_date": "2025-01-15",
                    "results": 85
                }
            }
            
            response = self.session.post(
                f"{self.base_url}/forms/responses",
                json=response_data,
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 201:
                data = response.json()
                if data.get('status') == 'success':
                    form_response = data.get('data', {})
                    self.log_result(
                        "Forms Responses Submit Test",
                        True,
                        "Successfully submitted form response",
                        {
                            "status_code": response.status_code,
                            "response_id": form_response.get('id'),
                            "form_template_id": form_response.get('form_template_id'),
                            "player_id": form_response.get('player_id'),
                            "team_id": form_response.get('team_id'),
                            "message": data.get('message')
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Responses Submit Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Responses Submit Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data,
                        "response_data": response_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Responses Submit Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_forms_responses_get_all(self) -> bool:
        """Test GET /api/v1/forms/responses endpoint"""
        if not self.access_token:
            self.log_result(
                "Forms Responses Get All Test",
                False,
                "No access token available - login test must pass first",
                {}
            )
            return False
            
        try:
            headers = {
                'Authorization': f'Bearer {self.access_token}',
                'Content-Type': 'application/json'
            }
            
            response = self.session.get(
                f"{self.base_url}/forms/responses",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success':
                    responses_data = data.get('data', {})
                    responses = responses_data.get('data', []) if isinstance(responses_data, dict) else responses_data
                    self.log_result(
                        "Forms Responses Get All Test",
                        True,
                        f"Successfully retrieved form responses - {len(responses)} responses found",
                        {
                            "status_code": response.status_code,
                            "responses_count": len(responses),
                            "sample_responses": responses[:2] if responses else []
                        }
                    )
                    return True
                else:
                    self.log_result(
                        "Forms Responses Get All Test",
                        False,
                        f"API returned error: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                try:
                    error_data = response.json()
                except:
                    error_data = {"text": response.text}
                    
                self.log_result(
                    "Forms Responses Get All Test",
                    False,
                    f"HTTP {response.status_code}: {error_data.get('message', response.text)}",
                    {
                        "status_code": response.status_code,
                        "error_data": error_data
                    }
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Forms Responses Get All Test",
                False,
                f"Request failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def test_database_tables_verification(self) -> bool:
        """Test database tables verification for Forms API"""
        try:
            response = self.session.get(f"{self.base_url}/test", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'success' and 'data' in data:
                    db_data = data['data']
                    tables_count = db_data.get('tables_count', 0)
                    
                    # Check if we have the expected tables for Forms API
                    # Expected: form_templates, form_responses, condition_tests, action_type_tests, skill_assessments
                    expected_minimum = 25  # Previous tables + new form tables
                    tables_sufficient = isinstance(tables_count, (int, str)) and int(tables_count) >= expected_minimum
                    
                    self.log_result(
                        "Database Tables Verification Test",
                        tables_sufficient,
                        f"Database tables {'verified' if tables_sufficient else 'insufficient'} - {tables_count} tables found (expected >= {expected_minimum})",
                        {
                            "database": db_data.get('database'),
                            "tables_count": tables_count,
                            "expected_minimum": expected_minimum,
                            "includes_form_tables": tables_sufficient,
                            "timestamp": db_data.get('timestamp')
                        }
                    )
                    return tables_sufficient
                else:
                    self.log_result(
                        "Database Tables Verification Test",
                        False,
                        f"Database test failed: {data.get('message', 'Unknown error')}",
                        {"response": data}
                    )
                    return False
            else:
                self.log_result(
                    "Database Tables Verification Test",
                    False,
                    f"HTTP {response.status_code}: {response.text}",
                    {"status_code": response.status_code}
                )
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_result(
                "Database Tables Verification Test",
                False,
                f"Database verification test failed: {str(e)}",
                {"error_type": type(e).__name__}
            )
            return False

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests for Forms API system"""
        print("🚀 Starting SportTeams Laravel Backend API Tests - Forms API System")
        print(f"🔗 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Test sequence for Forms API
        tests = [
            ("Basic Connection", self.test_basic_connection),
            ("Database Connection", self.test_database_connection),
            ("CORS Configuration", self.test_cors_configuration),
            ("Authentication Login", self.test_authentication_login),
            ("JWT Token Validation", self.test_jwt_token_validation),
            ("Security Middleware", self.test_security_middleware),
            ("Token Refresh", self.test_token_refresh),
            ("Database Tables Verification", self.test_database_tables_verification),
            ("Forms Templates Get All", self.test_forms_templates_get_all),
            ("Forms Templates Create", self.test_forms_templates_create),
            ("Forms Active Get", self.test_forms_active_get),
            ("Forms Template Toggle Active", self.test_forms_template_toggle_active),
            ("Forms Statistics Get", self.test_forms_statistics_get),
            ("Forms Responses Submit", self.test_forms_responses_submit),
            ("Forms Responses Get All", self.test_forms_responses_get_all),
            ("Logout Functionality", self.test_logout_functionality),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(
                    test_name,
                    False,
                    f"Test execution error: {str(e)}",
                    {"error_type": type(e).__name__}
                )
                failed += 1
        
        # Summary
        print("=" * 60)
        print(f"📊 FORMS API TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return {
            "total_tests": len(tests),
            "passed": passed,
            "failed": failed,
            "success_rate": passed/(passed+failed)*100 if (passed+failed) > 0 else 0,
            "results": self.test_results
        }

def main():
    """Main test execution"""
    tester = SportTeamsBackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if results["failed"] == 0 else 1)

if __name__ == "__main__":
    main()