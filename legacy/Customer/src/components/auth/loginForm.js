// Authentication Components for RushBox
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoading = false;
    }

    // Generate Login Form HTML
    generateLoginForm() {
        return `
            <div class="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div class="w-full max-w-md">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <!-- Mini Logo -->
                        <div class="w-16 h-16 mx-auto mb-4 relative">
                            <div class="absolute inset-0 bg-primary-400 rounded-xl flex items-center justify-center box-shadow-custom">
                                <i class="fas fa-shipping-fast text-dark-900 text-xl"></i>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold text-white mb-2">Welcome Back!</h1>
                        <p class="text-primary-200">Sign in to continue to RushBox</p>
                    </div>

                    <!-- Login Form -->
                    <div class="bg-white rounded-3xl p-8 box-shadow-custom">
                        <form id="loginForm" class="space-y-6">
                            <!-- Phone Number Input -->
                            <div class="space-y-2">
                                <label for="loginPhone" class="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-phone text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="tel" 
                                        id="loginPhone" 
                                        class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="+263 77 123 4567"
                                        required
                                    >
                                </div>
                            </div>

                            <!-- Password Input -->
                            <div class="space-y-2">
                                <label for="loginPassword" class="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-lock text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="password" 
                                        id="loginPassword" 
                                        class="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your password"
                                        required
                                    >
                                    <button 
                                        type="button" 
                                        id="toggleLoginPassword"
                                        class="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        <i class="fas fa-eye text-gray-400 hover:text-gray-600"></i>
                                    </button>
                                </div>
                            </div>

                            <!-- Remember Me & Forgot Password -->
                            <div class="flex items-center justify-between">
                                <label class="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        id="rememberMe"
                                        class="w-4 h-4 text-primary-400 border-gray-300 rounded focus:ring-primary-400"
                                    >
                                    <span class="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <button 
                                    type="button" 
                                    id="forgotPasswordBtn"
                                    class="text-sm text-primary-400 hover:text-primary-500 font-medium"
                                >
                                    Forgot Password?
                                </button>
                            </div>

                            <!-- Login Button -->
                            <button 
                                type="submit" 
                                id="loginSubmitBtn"
                                class="w-full bg-primary-400 text-dark-900 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 btn-hover-effect box-shadow-custom disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span id="loginButtonText">Sign In</span>
                                <div id="loginButtonSpinner" class="loading-spinner mx-auto hidden"></div>
                            </button>

                            <!-- Divider -->
                            <div class="relative my-6">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-gray-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white text-gray-500">Or continue with</span>
                                </div>
                            </div>

                            <!-- Quick Login Options -->
                            <div class="grid grid-cols-2 gap-4">
                                <button 
                                    type="button" 
                                    id="googleLoginBtn"
                                    class="w-full border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:bg-gray-50"
                                >
                                    <i class="fab fa-google text-red-500 mr-2"></i>
                                    Google
                                </button>
                                <button 
                                    type="button" 
                                    id="otpLoginBtn"
                                    class="w-full border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:bg-gray-50"
                                >
                                    <i class="fas fa-sms text-primary-400 mr-2"></i>
                                    OTP
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Sign Up Link -->
                    <div class="text-center mt-6">
                        <p class="text-primary-200">
                            Don't have an account? 
                            <button id="switchToRegister" class="text-primary-400 font-semibold hover:underline">
                                Sign Up
                            </button>
                        </p>
                    </div>

                    <!-- Back Button -->
                    <button id="backToWelcome" class="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Generate Register Form HTML
    generateRegisterForm() {
        return `
            <div class="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div class="w-full max-w-md">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <!-- Mini Logo -->
                        <div class="w-16 h-16 mx-auto mb-4 relative">
                            <div class="absolute inset-0 bg-primary-400 rounded-xl flex items-center justify-center box-shadow-custom">
                                <i class="fas fa-shipping-fast text-dark-900 text-xl"></i>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold text-white mb-2">Create Account</h1>
                        <p class="text-primary-200">Join RushBox for fast deliveries</p>
                    </div>

                    <!-- Register Form -->
                    <div class="bg-white rounded-3xl p-8 box-shadow-custom">
                        <form id="registerForm" class="space-y-6">
                            <!-- Full Name Input -->
                            <div class="space-y-2">
                                <label for="registerName" class="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-user text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        id="registerName" 
                                        class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter your full name"
                                        required
                                    >
                                </div>
                            </div>

                            <!-- Phone Number Input -->
                            <div class="space-y-2">
                                <label for="registerPhone" class="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-phone text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="tel" 
                                        id="registerPhone" 
                                        class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="+263 77 123 4567"
                                        required
                                    >
                                </div>
                            </div>

                            <!-- Email Input (Optional) -->
                            <div class="space-y-2">
                                <label for="registerEmail" class="block text-sm font-medium text-gray-700">
                                    Email Address <span class="text-gray-400">(Optional)</span>
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-envelope text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="email" 
                                        id="registerEmail" 
                                        class="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="your.email@example.com"
                                    >
                                </div>
                            </div>

                            <!-- Password Input -->
                            <div class="space-y-2">
                                <label for="registerPassword" class="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div class="relative">
                                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <i class="fas fa-lock text-gray-400"></i>
                                    </div>
                                    <input 
                                        type="password" 
                                        id="registerPassword" 
                                        class="w-full pl-12 pr-12 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200"
                                        placeholder="Create a strong password"
                                        required
                                    >
                                    <button 
                                        type="button" 
                                        id="toggleRegisterPassword"
                                        class="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        <i class="fas fa-eye text-gray-400 hover:text-gray-600"></i>
                                    </button>
                                </div>
                                <!-- Password Strength Indicator -->
                                <div class="mt-2">
                                    <div class="flex space-x-1">
                                        <div id="strength1" class="flex-1 h-2 rounded-full bg-gray-200"></div>
                                        <div id="strength2" class="flex-1 h-2 rounded-full bg-gray-200"></div>
                                        <div id="strength3" class="flex-1 h-2 rounded-full bg-gray-200"></div>
                                        <div id="strength4" class="flex-1 h-2 rounded-full bg-gray-200"></div>
                                    </div>
                                    <p id="strengthText" class="text-xs text-gray-500 mt-1">Password strength</p>
                                </div>
                            </div>

                            <!-- Terms and Conditions -->
                            <div class="space-y-4">
                                <label class="flex items-start">
                                    <input 
                                        type="checkbox" 
                                        id="acceptTerms"
                                        class="w-4 h-4 text-primary-400 border-gray-300 rounded focus:ring-primary-400 mt-1"
                                        required
                                    >
                                    <span class="ml-3 text-sm text-gray-600">
                                        I agree to RushBox's 
                                        <a href="#" class="text-primary-400 hover:underline">Terms of Service</a> 
                                        and 
                                        <a href="#" class="text-primary-400 hover:underline">Privacy Policy</a>
                                    </span>
                                </label>
                                
                                <label class="flex items-start">
                                    <input 
                                        type="checkbox" 
                                        id="acceptMarketing"
                                        class="w-4 h-4 text-primary-400 border-gray-300 rounded focus:ring-primary-400 mt-1"
                                    >
                                    <span class="ml-3 text-sm text-gray-600">
                                        I want to receive promotional offers and updates via SMS and email
                                    </span>
                                </label>
                            </div>

                            <!-- Register Button -->
                            <button 
                                type="submit" 
                                id="registerSubmitBtn"
                                class="w-full bg-primary-400 text-dark-900 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 btn-hover-effect box-shadow-custom disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span id="registerButtonText">Create Account</span>
                                <div id="registerButtonSpinner" class="loading-spinner mx-auto hidden"></div>
                            </button>

                            <!-- Divider -->
                            <div class="relative my-6">
                                <div class="absolute inset-0 flex items-center">
                                    <div class="w-full border-t border-gray-200"></div>
                                </div>
                                <div class="relative flex justify-center text-sm">
                                    <span class="px-4 bg-white text-gray-500">Or sign up with</span>
                                </div>
                            </div>

                            <!-- Social Registration -->
                            <div class="grid grid-cols-2 gap-4">
                                <button 
                                    type="button" 
                                    id="googleRegisterBtn"
                                    class="w-full border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:bg-gray-50"
                                >
                                    <i class="fab fa-google text-red-500 mr-2"></i>
                                    Google
                                </button>
                                <button 
                                    type="button" 
                                    id="otpRegisterBtn"
                                    class="w-full border border-gray-200 text-gray-700 font-medium py-3 px-4 rounded-2xl transition-all duration-200 hover:bg-gray-50"
                                >
                                    <i class="fas fa-sms text-primary-400 mr-2"></i>
                                    OTP Only
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Sign In Link -->
                    <div class="text-center mt-6">
                        <p class="text-primary-200">
                            Already have an account? 
                            <button id="switchToLogin" class="text-primary-400 font-semibold hover:underline">
                                Sign In
                            </button>
                        </p>
                    </div>

                    <!-- Back Button -->
                    <button id="backToWelcomeFromRegister" class="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Generate OTP Verification Form
    generateOTPForm(phoneNumber) {
        return `
            <div class="min-h-screen gradient-bg flex items-center justify-center p-6">
                <div class="w-full max-w-md">
                    <!-- Header -->
                    <div class="text-center mb-8">
                        <!-- Mini Logo -->
                        <div class="w-16 h-16 mx-auto mb-4 relative">
                            <div class="absolute inset-0 bg-primary-400 rounded-xl flex items-center justify-center box-shadow-custom">
                                <i class="fas fa-shield-alt text-dark-900 text-xl"></i>
                            </div>
                        </div>
                        <h1 class="text-3xl font-bold text-white mb-2">Verify Phone</h1>
                        <p class="text-primary-200 mb-2">Enter the 6-digit code sent to</p>
                        <p class="text-primary-400 font-semibold">${phoneNumber}</p>
                    </div>

                    <!-- OTP Form -->
                    <div class="bg-white rounded-3xl p-8 box-shadow-custom">
                        <form id="otpForm" class="space-y-6">
                            <!-- OTP Input -->
                            <div class="space-y-4">
                                <div class="flex justify-center space-x-3">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="0">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="1">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="2">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="3">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="4">
                                    <input type="text" maxlength="1" class="otp-input w-12 h-12 text-center text-xl font-bold border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-400 focus:border-transparent" data-index="5">
                                </div>
                                
                                <!-- Timer -->
                                <div class="text-center">
                                    <p class="text-gray-500 text-sm">
                                        Code expires in <span id="otpTimer" class="font-semibold text-primary-400">05:00</span>
                                    </p>
                                </div>
                            </div>

                            <!-- Verify Button -->
                            <button 
                                type="submit" 
                                id="verifyOtpBtn"
                                class="w-full bg-primary-400 text-dark-900 font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 btn-hover-effect box-shadow-custom disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span id="verifyButtonText">Verify Code</span>
                                <div id="verifyButtonSpinner" class="loading-spinner mx-auto hidden"></div>
                            </button>

                            <!-- Resend Code -->
                            <div class="text-center">
                                <p class="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
                                <button 
                                    type="button" 
                                    id="resendOtpBtn"
                                    class="text-primary-400 font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled
                                >
                                    Resend Code
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Back Button -->
                    <button id="backFromOtp" class="absolute top-6 left-6 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Initialize authentication functionality
    initAuth() {
        this.setupPasswordToggle();
        this.setupFormValidation();
        this.setupOTPInput();
        this.setupEventListeners();
    }

    setupPasswordToggle() {
        // Toggle password visibility
        document.addEventListener('click', (e) => {
            if (e.target.closest('#toggleLoginPassword')) {
                this.togglePassword('loginPassword', e.target);
            }
            if (e.target.closest('#toggleRegisterPassword')) {
                this.togglePassword('registerPassword', e.target);
            }
        });
    }

    togglePassword(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    setupFormValidation() {
        // Password strength checker
        document.addEventListener('input', (e) => {
            if (e.target.id === 'registerPassword') {
                this.checkPasswordStrength(e.target.value);
            }
        });

        // Phone number formatting
        document.addEventListener('input', (e) => {
            if (e.target.type === 'tel') {
                this.formatPhoneNumber(e.target);
            }
        });
    }

    checkPasswordStrength(password) {
        const indicators = ['strength1', 'strength2', 'strength3', 'strength4'];
        const strengthText = document.getElementById('strengthText');
        
        let strength = 0;
        let text = 'Very Weak';
        let color = 'bg-red-400';

        // Check criteria
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Reset all indicators
        indicators.forEach(id => {
            const el = document.getElementById(id);
            el.className = 'flex-1 h-2 rounded-full bg-gray-200';
        });

        // Set strength level
        switch (strength) {
            case 1:
                text = 'Weak';
                color = 'bg-red-400';
                break;
            case 2:
                text = 'Fair';
                color = 'bg-yellow-400';
                break;
            case 3:
                text = 'Good';
                color = 'bg-blue-400';
                break;
            case 4:
                text = 'Strong';
                color = 'bg-green-400';
                break;
        }

        // Update indicators
        for (let i = 0; i < strength; i++) {
            document.getElementById(indicators[i]).className = `flex-1 h-2 rounded-full ${color}`;
        }

        if (strengthText) {
            strengthText.textContent = text;
            strengthText.className = `text-xs mt-1 ${strength >= 3 ? 'text-green-600' : 'text-gray-500'}`;
        }
    }

    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        // Add Zimbabwe country code if not present
        if (value.length > 0 && !value.startsWith('263')) {
            if (value.startsWith('0')) {
                value = '263' + value.substring(1);
            } else if (value.startsWith('7')) {
                value = '263' + value;
            }
        }
        
        // Format: +263 77 123 4567
        if (value.startsWith('263')) {
            if (value.length <= 3) {
                input.value = '+' + value;
            } else if (value.length <= 5) {
                input.value = '+' + value.substring(0, 3) + ' ' + value.substring(3);
            } else if (value.length <= 8) {
                input.value = '+' + value.substring(0, 3) + ' ' + value.substring(3, 5) + ' ' + value.substring(5);
            } else {
                input.value = '+' + value.substring(0, 3) + ' ' + value.substring(3, 5) + ' ' + value.substring(5, 8) + ' ' + value.substring(8, 12);
            }
        }
    }

    setupOTPInput() {
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('otp-input')) {
                this.handleOTPInput(e);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('otp-input') && e.key === 'Backspace') {
                this.handleOTPBackspace(e);
            }
        });
    }

    handleOTPInput(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        
        if (input.value.length === 1 && index < 5) {
            const nextInput = document.querySelector(`.otp-input[data-index="${index + 1}"]`);
            if (nextInput) nextInput.focus();
        }
        
        // Check if all inputs are filled
        const allInputs = document.querySelectorAll('.otp-input');
        const allFilled = Array.from(allInputs).every(inp => inp.value.length === 1);
        
        if (allFilled) {
            // Auto-submit or enable submit button
            document.getElementById('verifyOtpBtn').classList.remove('opacity-50');
        }
    }

    handleOTPBackspace(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        
        if (input.value === '' && index > 0) {
            const prevInput = document.querySelector(`.otp-input[data-index="${index - 1}"]`);
            if (prevInput) {
                prevInput.focus();
                prevInput.value = '';
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            // Switch between login and register
            if (e.target.id === 'switchToRegister') {
                this.showRegisterForm();
            }
            if (e.target.id === 'switchToLogin') {
                this.showLoginForm();
            }
            
            // Back buttons
            if (e.target.closest('#backToWelcome') || e.target.closest('#backToWelcomeFromRegister')) {
                app.showWelcome();
            }
            
            // Social login buttons
            if (e.target.closest('#googleLoginBtn') || e.target.closest('#googleRegisterBtn')) {
                this.handleGoogleAuth();
            }
            
            if (e.target.closest('#otpLoginBtn') || e.target.closest('#otpRegisterBtn')) {
                this.showOTPForm('+263 77 123 4567'); // Demo number
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e.target);
            }
            if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister(e.target);
            }
            if (e.target.id === 'otpForm') {
                e.preventDefault();
                this.handleOTPVerification(e.target);
            }
        });
    }

    showLoginForm() {
        document.getElementById('authContainer').innerHTML = this.generateLoginForm();
        this.initAuth();
    }

    showRegisterForm() {
        document.getElementById('authContainer').innerHTML = this.generateRegisterForm();
        this.initAuth();
    }

    showOTPForm(phoneNumber) {
        document.getElementById('authContainer').innerHTML = this.generateOTPForm(phoneNumber);
        this.initAuth();
        this.startOTPTimer();
    }

    startOTPTimer() {
        let timeLeft = 300; // 5 minutes
        const timerElement = document.getElementById('otpTimer');
        const resendBtn = document.getElementById('resendOtpBtn');
        
        const timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendBtn.disabled = false;
                resendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                timerElement.textContent = '00:00';
            }
            
            timeLeft--;
        }, 1000);
    }

    async handleLogin(form) {
        const submitBtn = document.getElementById('loginSubmitBtn');
        const buttonText = document.getElementById('loginButtonText');
        const spinner = document.getElementById('loginButtonSpinner');
        
        // Show loading state
        this.setLoadingState(submitBtn, buttonText, spinner, true);
        
        try {
            const formData = new FormData(form);
            const phone = document.getElementById('loginPhone').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo, always succeed
            console.log('Login successful!', { phone, password });
            
            // Navigate to main app
            app.showMainApp();
            
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, buttonText, spinner, false);
        }
    }

    async handleRegister(form) {
        const submitBtn = document.getElementById('registerSubmitBtn');
        const buttonText = document.getElementById('registerButtonText');
        const spinner = document.getElementById('registerButtonSpinner');
        
        // Show loading state
        this.setLoadingState(submitBtn, buttonText, spinner, true);
        
        try {
            const name = document.getElementById('registerName').value;
            const phone = document.getElementById('registerPhone').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // For demo, show OTP verification
            this.showOTPForm(phone);
            
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, buttonText, spinner, false);
        }
    }

    async handleOTPVerification(form) {
        const submitBtn = document.getElementById('verifyOtpBtn');
        const buttonText = document.getElementById('verifyButtonText');
        const spinner = document.getElementById('verifyButtonSpinner');
        
        // Get OTP value
        const otpInputs = document.querySelectorAll('.otp-input');
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }
        
        // Show loading state
        this.setLoadingState(submitBtn, buttonText, spinner, true);
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log('OTP verified!', otp);
            
            // Navigate to main app
            app.showMainApp();
            
        } catch (error) {
            console.error('OTP verification failed:', error);
            alert('Invalid code. Please try again.');
        } finally {
            this.setLoadingState(submitBtn, buttonText, spinner, false);
        }
    }

    handleGoogleAuth() {
        // Placeholder for Google authentication
        alert('Google authentication would be implemented here with Firebase Auth');
    }

    setLoadingState(button, textElement, spinner, isLoading) {
        if (isLoading) {
            button.disabled = true;
            textElement.classList.add('hidden');
            spinner.classList.remove('hidden');
        } else {
            button.disabled = false;
            textElement.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }
}

// Export for use in main app
window.AuthManager = AuthManager;