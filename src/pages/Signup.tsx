import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Mail, Lock, Eye, EyeOff, Globe, ArrowLeft, Shield, Check, Flag, MapPin, Briefcase, DollarSign, Target, Languages, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { APP_CONFIG } from "@/config/app";

const countries = APP_CONFIG.supportedCountries.map((country, index) => {
  const codes = ["IN", "PH", "CN", "BD", "MM", "TH", "VN"];
  return {
    code: codes[index] || "XX",
    name: country,
    flag: <Flag className="h-4 w-4" />
  };
});

const benefits = APP_CONFIG.features;

// Validation functions
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  // Check if it's a valid phone number (8-15 digits)
  return cleanPhone.length >= 8 && cleanPhone.length <= 15;
};

const validatePassword = (password: string): { isValid: boolean; strength: string; requirements: string[] } => {
  const requirements = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
    requirements.push("At least 8 characters");
  } else {
    requirements.push("At least 8 characters");
  }

  if (/[a-z]/.test(password)) {
    score += 1;
    requirements.push("Lowercase letter");
  } else {
    requirements.push("Lowercase letter");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
    requirements.push("Uppercase letter");
  } else {
    requirements.push("Uppercase letter");
  }

  if (/\d/.test(password)) {
    score += 1;
    requirements.push("Number");
  } else {
    requirements.push("Number");
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
    requirements.push("Special character");
  } else {
    requirements.push("Special character");
  }

  let strength = "Weak";
  if (score >= 4) strength = "Strong";
  else if (score >= 3) strength = "Medium";

  return {
    isValid: score >= 4,
    strength,
    requirements
  };
};

const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());
};

const validateIncome = (income: string): boolean => {
  const numIncome = parseInt(income);
  return !isNaN(numIncome) && numIncome >= 500 && numIncome <= 50000;
};

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    country: "",
    occupation: "",
    monthlyIncome: "",
    financialGoals: "",
    language: "en"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [passwordValidation, setPasswordValidation] = useState({ isValid: false, strength: "Weak", requirements: [] });
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { signUp } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
    
    // Real-time validation for specific fields
    if (field === "password") {
      const validation = validatePassword(value);
      setPasswordValidation(validation);
    }
  };

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case "fullName":
        if (!value.trim()) return "Full name is required";
        if (!validateName(value)) return "Please enter a valid name (letters, spaces, hyphens, and apostrophes only)";
        return "";
      
      case "email":
        if (!value.trim()) return "Email address is required";
        if (!validateEmail(value)) return "Please enter a valid email address";
        return "";
      
      case "phone":
        if (value.trim() && !validatePhone(value)) return "Please enter a valid phone number (8-15 digits)";
        return "";
      
      case "country":
        if (!value) return "Please select your country";
        return "";
      
      case "occupation":
        if (!value.trim()) return "Occupation is required";
        if (value.trim().length < 2) return "Occupation must be at least 2 characters";
        return "";
      
      case "monthlyIncome":
        if (!value.trim()) return "Monthly income is required";
        if (!validateIncome(value)) return "Please enter a valid income between $500 and $50,000";
        return "";
      
      case "password":
        if (!value) return "Password is required";
        const passwordValidation = validatePassword(value);
        if (!passwordValidation.isValid) return "Password does not meet requirements";
        return "";
      
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      
      default:
        return "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const errors: {[key: string]: string} = {};
    const fieldsToValidate = ['fullName', 'email', 'phone', 'country', 'occupation', 'monthlyIncome', 'password', 'confirmPassword'];
    
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) {
        errors[field] = error;
      }
    });

    // Check terms agreement
    if (!agreeTerms) {
      errors.terms = "Please accept our terms and conditions to continue";
    }

    // Set validation errors
    setValidationErrors(errors);

    // If there are validation errors, show the first one
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await signUp(
        formData.email,
        formData.password,
        formData.fullName,
        formData.phone,
        formData.country,
        formData.occupation,
        formData.monthlyIncome ? parseInt(formData.monthlyIncome) : undefined,
        formData.financialGoals ? formData.financialGoals.split(',').map(goal => goal.trim()) : []
      );

      if (!error) {
        toast({
          title: `Welcome to ${APP_CONFIG.name}! 🎉`,
          description: "Your account has been created successfully! Please check your email to verify your account, then sign in.",
        });
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          country: "",
          occupation: "",
          monthlyIncome: "",
          financialGoals: "",
          language: "en"
        });
        setAgreeTerms(false);
        navigate("/login");
      }
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-auth flex items-center justify-center p-4">
      <div className="w-full max-w-4xl flex gap-8">
        
        {/* Left Side - Benefits */}
        <div className="hidden lg:flex flex-col justify-center flex-1 text-white space-y-8">
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10 mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <Logo size="xl" showText={true} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold">Join {APP_CONFIG.name}</h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Start your journey towards financial independence with Singapore's most trusted 
                financial education platform for migrant workers.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">What you'll get:</h3>
            <div className="space-y-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <p className="text-sm text-white/80">
              "{APP_CONFIG.name} helped me save $2,000 in my first year and learn how to send money home safely. 
              The modules are easy to understand in my language!"
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">AR</span>
              </div>
              <div>
                <p className="font-medium text-sm">Amit R.</p>
                <p className="text-xs text-white/70">Construction Worker</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 max-w-md">
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <Card className="backdrop-blur-sm bg-white/95 shadow-glow border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Join thousands of migrant workers building their financial future
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className={`pl-10 h-12 ${validationErrors.fullName ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 h-12 ${validationErrors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number (Optional)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+65 9123 4567"
                      value={formData.phone}
                      onChange={(e) => {
                        // Format phone number as user types
                        let value = e.target.value;
                        // Remove all non-digit characters except +
                        value = value.replace(/[^\d+]/g, '');
                        // Limit to 15 characters
                        if (value.length > 15) value = value.substring(0, 15);
                        handleInputChange("phone", value);
                      }}
                      className={`pl-10 h-12 ${validationErrors.phone ? 'border-red-500 focus:border-red-500' : ''}`}
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.phone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Enter your phone number with country code (e.g., +65 9123 4567)
                  </p>
                </div>

                {/* Country & Language Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-sm font-medium">
                      Country *
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger className={`h-12 ${validationErrors.country ? 'border-red-500 focus:border-red-500' : ''}`}>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                              {country.flag} {country.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.country && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.country}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-sm font-medium">
                      Language *
                    </Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                        <SelectItem value="cn">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            中文
                          </div>
                        </SelectItem>
                        <SelectItem value="hi">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            हिन्दी
                          </div>
                        </SelectItem>
                        <SelectItem value="tl">
                          <div className="flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            Tagalog
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Occupation & Monthly Income Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="occupation" className="text-sm font-medium">
                      Occupation *
                    </Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="occupation"
                        type="text"
                        placeholder="e.g., Construction Worker"
                        value={formData.occupation}
                        onChange={(e) => handleInputChange("occupation", e.target.value)}
                        className={`pl-10 h-12 ${validationErrors.occupation ? 'border-red-500 focus:border-red-500' : ''}`}
                        required
                      />
                    </div>
                    {validationErrors.occupation && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.occupation}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome" className="text-sm font-medium">
                      Monthly Income (SGD) *
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="monthlyIncome"
                        type="number"
                        placeholder="2000"
                        value={formData.monthlyIncome}
                        onChange={(e) => handleInputChange("monthlyIncome", e.target.value)}
                        className={`pl-10 h-12 ${validationErrors.monthlyIncome ? 'border-red-500 focus:border-red-500' : ''}`}
                        min="500"
                        max="50000"
                        required
                      />
                    </div>
                    {validationErrors.monthlyIncome && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {validationErrors.monthlyIncome}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Enter amount between $500 - $50,000
                    </p>
                  </div>
                </div>

                {/* Financial Goals */}
                <div className="space-y-2">
                  <Label htmlFor="financialGoals" className="text-sm font-medium">
                    Financial Goals (Optional)
                  </Label>
                  <div className="relative">
                    <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="financialGoals"
                      type="text"
                      placeholder="e.g., Save for emergency fund, Send money home, Buy a house"
                      value={formData.financialGoals}
                      onChange={(e) => handleInputChange("financialGoals", e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Separate multiple goals with commas
                  </p>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      onFocus={() => setShowPasswordRequirements(true)}
                      onBlur={() => setShowPasswordRequirements(false)}
                      className={`pl-10 pr-10 h-12 ${validationErrors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              passwordValidation.strength === 'Strong' ? 'bg-green-500' :
                              passwordValidation.strength === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: passwordValidation.strength === 'Strong' ? '100%' : passwordValidation.strength === 'Medium' ? '66%' : '33%' }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          passwordValidation.strength === 'Strong' ? 'text-green-600' :
                          passwordValidation.strength === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {passwordValidation.strength}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Password Requirements */}
                  {showPasswordRequirements && formData.password && (
                    <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                      <p className="text-xs font-medium text-gray-700">Password Requirements:</p>
                      {passwordValidation.requirements.map((requirement, index) => {
                        const isValid = passwordValidation.requirements[index] && 
                          (requirement.includes('8 characters') ? formData.password.length >= 8 :
                           requirement.includes('Lowercase') ? /[a-z]/.test(formData.password) :
                           requirement.includes('Uppercase') ? /[A-Z]/.test(formData.password) :
                           requirement.includes('Number') ? /\d/.test(formData.password) :
                           requirement.includes('Special') ? /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) : false);
                        
                        return (
                          <div key={index} className="flex items-center gap-2 text-xs">
                            {isValid ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-gray-400" />
                            )}
                            <span className={isValid ? 'text-green-600' : 'text-gray-500'}>
                              {requirement}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {validationErrors.password && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password *
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className={`pl-10 pr-10 h-12 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Terms Agreement */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox 
                      id="terms" 
                      checked={agreeTerms}
                      onCheckedChange={(checked) => {
                        setAgreeTerms(checked as boolean);
                        if (validationErrors.terms) {
                          setValidationErrors(prev => ({ ...prev, terms: "" }));
                        }
                      }}
                      className={`mt-0.5 ${validationErrors.terms ? 'border-red-500' : ''}`}
                    />
                    <Label htmlFor="terms" className="text-sm leading-5">
                      I agree to {APP_CONFIG.name}'s{" "}
                      <Link to="/terms" className="text-primary hover:underline font-medium">
                        Terms of Service
                      </Link>
                      {" "}and{" "}
                      <Link to="/privacy" className="text-primary hover:underline font-medium">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  {validationErrors.terms && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {validationErrors.terms}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full h-12 font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}