#!/usr/bin/env python3
"""
SportTeams Laravel Backend API Test Suite
Tests the Laravel backend API connectivity and functionality
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
        
        # Test credentials from the review request
        self.test_credentials = {
            "email": "admin@sportteams.nl",
            "password": "admin123"
        }
        
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

    def run_all_tests(self) -> Dict[str, Any]:
        """Run all backend tests"""
        print("🚀 Starting SportTeams Laravel Backend API Tests")
        print(f"🔗 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Basic Connection", self.test_basic_connection),
            ("Database Connection", self.test_database_connection),
            ("CORS Configuration", self.test_cors_configuration),
            ("Authentication Login", self.test_authentication_login),
            ("JWT Token Validation", self.test_jwt_token_validation),
            ("Security Middleware", self.test_security_middleware),
            ("Token Refresh", self.test_token_refresh),
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
        print(f"📊 TEST SUMMARY")
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