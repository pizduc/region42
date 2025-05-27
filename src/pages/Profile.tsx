
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Home, Check, ArrowRight, Loader2, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const userId = localStorage.getItem("userId");

  const [agreementAccepted, setAgreementAccepted] = useState(false);

  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [suggestions, setSuggestions] = useState<{value: string}[]>([]);
  const [activeField, setActiveField] = useState("");
  const [isProfileLocked, setIsProfileLocked] = useState(false);

  const [emailCode, setEmailCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [stepsCompleted, setStepsCompleted] = useState({
    personalInfo: false,
    phone: false,
    email: false,
    emailVerification: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ... keep existing code (all functions like fetchSuggestions, applySuggestion, useEffect, sendEmailCode, verifyEmailCode, handleSave, handleLogout, handleBackToMain, handlePhoneChange, validatePersonalInfo, validatePhone, validateEmail, handleNextStep)

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const params = new URLSearchParams({ query });
      const response = await fetch(`https://best-yard.onrender.com/api/suggest-fio?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      } else {
        console.error("Ошибка при получении подсказок:", response.statusText);
      }
    } catch (err) {
      console.error("Ошибка при получении подсказок:", err);
    }
  };

  const applySuggestion = (value: string) => {
    if (activeField === "lastName") setLastName(value);
    if (activeField === "firstName") setFirstName(value);
    if (activeField === "middleName") setMiddleName(value);
    setSuggestions([]);
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    setIsLoading(true);

    fetch(`https://best-yard.onrender.com/api/user/profile/${userId}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("Profile data:", data);
        const { last_name, first_name, middle_name, phone, email, email_verified, is_profile_complete } = data;
        
        setLastName(last_name || "");
        setFirstName(first_name || "");
        setMiddleName(middle_name || "");
        setPhone(phone || "");
        setEmail(email || "");

        if (email_verified) {
          console.log("Email is verified:", email_verified);
          setIsEmailVerified(true);
          setStepsCompleted(prev => ({
            ...prev,
            emailVerification: true,
            email: true
          }));
        }

        if (is_profile_complete) {
          setIsProfileLocked(true);
          setSavedSuccessfully(true);
          setAgreementAccepted(true); 
        }

        const completedSteps = {
          personalInfo: !!(last_name && first_name && middle_name),
          phone: !!phone && phone.length >= 18, 
          email: !!email,
          emailVerification: !!email_verified
        };
        
        setStepsCompleted(completedSteps);

        if (is_profile_complete) {
          setCurrentStep(5);
        } else if (!completedSteps.personalInfo) {
          setCurrentStep(1);
        } else if (!completedSteps.phone) {
          setCurrentStep(2);
        } else if (!completedSteps.email) {
          setCurrentStep(3);
        } else if (!completedSteps.emailVerification) {
          setCurrentStep(4);
        } else {
          setCurrentStep(5); 
        }
      })
      .catch((error) => {
        console.error("Ошибка при получении профиля:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить данные профиля",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });

    fetch(`https://best-yard.onrender.com/api/user/addresses/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setUserAddresses(data || []);
      })
      .catch((err) => {
        console.error("Ошибка получения адресов:", err);
      });
  }, [userId, navigate, toast]);

  const sendEmailCode = async () => {
    if (!email || !userId) {
      toast({
        title: "Ошибка",
        description: "Необходимо указать email",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch("https://best-yard.onrender.com/api/email/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setCodeSent(true);
        toast({ title: "Код отправлен", description: "Проверьте почту" });
      } else {
        toast({ 
          title: "Ошибка", 
          description: data.error || "Не удалось отправить код", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Ошибка при отправке кода:", error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось отправить код", 
        variant: "destructive" 
      });
    }
  };

  const verifyEmailCode = async () => {
    try {
      const res = await fetch("https://best-yard.onrender.com/api/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code: emailCode }),
      });

      const data = await res.json();
      
      if (res.ok && data.message && data.message.includes("успешно")) {
        toast({ title: "Email подтверждён" });
        setIsEmailVerified(true);
        setStepsCompleted({...stepsCompleted, emailVerification: true});
        setCurrentStep(5);
      } else {
        toast({ 
          title: "Ошибка", 
          description: data.error || "Неверный или просроченный код",
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Ошибка при подтверждении кода:", error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось подтвердить код", 
        variant: "destructive" 
      });
    }
  };

  const handleSave = () => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Не найден user_id в localStorage",
      });
      return;
    }

    setIsSaving(true);
    setSavedSuccessfully(false);

    const userInfo = {
      userId,
      lastName,
      firstName,
      middleName,
      phone,
      email,
      isEmailVerified, 
      isProfileComplete: true 
    };

    fetch("https://best-yard.onrender.com/api/user/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userInfo),
    })
      .then((response) => response.json())
      .then(() => {
        toast({
          title: "Сохранено",
          description: "Данные успешно сохранены",
        });
        setSavedSuccessfully(true);
        setIsProfileLocked(true);
      })
      .catch((error) => {
        console.error("Ошибка:", error);
        toast({
          title: "Ошибка сохранения",
          description: "Не удалось сохранить данные. Попробуйте еще раз.",
          variant: "destructive"
        });
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem("userAddress");
    localStorage.removeItem("userId");
    toast({
      title: "Выход из системы",
      description: "Вы успешно вышли из личного кабинета",
    });
    navigate("/login");
  };

  const handleBackToMain = () => {
    navigate("/");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^\d]/g, '');
    if (!value.startsWith("7")) value = "7" + value;

    if (value.length <= 1) value = "+7";
    else if (value.length <= 4) value = "+7 (" + value.slice(1);
    else if (value.length <= 7) value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4);
    else if (value.length <= 9) value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4, 7) + "-" + value.slice(7);
    else value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4, 7) + "-" + value.slice(7, 9) + "-" + value.slice(9, 11);

    setPhone(value);
  };

  const validatePersonalInfo = () => {
    if (!lastName.trim() || !firstName.trim() || !middleName.trim()) {
      toast({ 
        title: "Заполните все поля", 
        description: "Необходимо указать фамилию, имя и отчество", 
        variant: "destructive" 
      });
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    if (!phone || phone.length < 18) {
      toast({ 
        title: "Неверный номер телефона", 
        description: "Введите полный номер в формате +7 (XXX) XXX-XX-XX", 
        variant: "destructive" 
      });
      return false;
    }
    return true;
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast({ 
        title: "Неверный email", 
        description: "Введите корректный адрес электронной почты", 
        variant: "destructive" 
      });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    switch(currentStep) {
      case 1:
        if (validatePersonalInfo()) {
          setStepsCompleted({...stepsCompleted, personalInfo: true});
          setCurrentStep(2);
        }
        break;
      case 2:
        if (validatePhone()) {
          setStepsCompleted({...stepsCompleted, phone: true});
          setCurrentStep(3);
        }
        break;
      case 3:
        if (validateEmail()) {
          setStepsCompleted({...stepsCompleted, email: true});
          setCurrentStep(4);
        }
        break;
      default:
        break;
    }
  };

  const renderStepContent = () => {
    if (isProfileLocked) {
      return (
        <>
          <div className="space-y-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-800 dark:text-green-200 font-medium">
                Профиль завершён и заблокирован для редактирования
              </p>
            </div>
            
            <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Фамилия:</span>
                  <span className="text-lg font-medium text-foreground">{lastName}</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Имя:</span>
                  <span className="text-lg font-medium text-foreground">{firstName}</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Отчество:</span>
                  <span className="text-lg font-medium text-foreground">{middleName}</span>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон:</span>
                  <span className="text-lg font-medium text-foreground">{phone}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium text-foreground">{email}</span>
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                    <Check className="h-3 w-3 mr-1" />
                    Подтвержден
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    switch(currentStep) {
      case 1:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{
                  id: "lastName", label: "Фамилия", value: lastName, setValue: setLastName
                }, {
                  id: "firstName", label: "Имя", value: firstName, setValue: setFirstName
                }, {
                  id: "middleName", label: "Отчество", value: middleName, setValue: setMiddleName
                }].map(({ id, label, value, setValue }) => (
                  <div key={id} className="relative space-y-2">
                    <label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <Input
                      id={id}
                      value={value}
                      onFocus={() => setActiveField(id)}
                      onChange={(e) => {
                        setValue(e.target.value);
                        fetchSuggestions(e.target.value);
                      }}
                      placeholder={`Введите ${label.toLowerCase()}`}
                      className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                    {activeField === id && suggestions.length > 0 && (
                      <ul className="absolute z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md w-full mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={() => applySuggestion(s.value)}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                          >
                            {s.value}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]" disabled={!agreementAccepted}>
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Номер телефона</label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 4:
        return (
          <>
            <div className="space-y-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">Подтвердите ваш email адрес</p>
              
              {codeSent ? (
                <div className="space-y-2">
                  <label htmlFor="emailCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">Введите код подтверждения</label>
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Введите код"
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400"
                  />
                  <Button 
                    onClick={verifyEmailCode} 
                    className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    disabled={!emailCode}
                  >
                    Подтвердить код
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={sendEmailCode} 
                  className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Отправить код на почту {email}
                </Button>
              )}
            </div>
          </>
        );
      
      case 5:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Все данные заполнены и подтверждены
                </p>
              </div>
              
              <div className="space-y-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Фамилия:</span>
                    <span className="text-lg font-medium text-foreground">{lastName}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Имя:</span>
                    <span className="text-lg font-medium text-foreground">{firstName}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Отчество:</span>
                    <span className="text-lg font-medium text-foreground">{middleName}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Телефон:</span>
                    <span className="text-lg font-medium text-foreground">{phone}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-foreground">{email}</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Подтвержден
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {savedSuccessfully ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Данные успешно сохранены
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleSave} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-semibold py-3 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Завершить регистрацию"
                )}
              </Button>
            )}
          </>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return "Личная информация";
      case 2: return "Номер телефона";
      case 3: return "Email адрес";
      case 4: return "Подтверждение email";
      case 5: return "Готово к сохранению";
      default: return "Личная информация";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium text-gray-900 dark:text-white">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border-0">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-4xl font-bold tracking-tight">Профиль</h1>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBackToMain} className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm">
                  <Home className="mr-2 h-4 w-4" />
                  На главную
                </Button>
                <Button variant="destructive" onClick={handleLogout} className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* User Addresses */}
        {userAddresses.length > 0 && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-200">Адреса пользователя</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userAddresses.map((addr, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600 dark:text-gray-400">Город:</span> <span className="text-gray-900 dark:text-gray-100">{addr.city}</span></div>
                    <div><span className="font-medium text-gray-600 dark:text-gray-400">Улица:</span> <span className="text-gray-900 dark:text-gray-100">{addr.street}</span></div>
                    <div><span className="font-medium text-gray-600 dark:text-gray-400">Дом:</span> <span className="text-gray-900 dark:text-gray-100">{addr.house}</span></div>
                    <div><span className="font-medium text-gray-600 dark:text-gray-400">Квартира:</span> <span className="text-gray-900 dark:text-gray-100">{addr.apartment}</span></div>
                    <div><span className="font-medium text-gray-600 dark:text-gray-400">Номер договора:</span> <span className="text-gray-900 dark:text-gray-100">{addr.contract_number}</span></div>
                    {addr.account_number && (
                      <div><span className="font-medium text-gray-600 dark:text-gray-400">Лицевой счёт:</span> <span className="text-gray-900 dark:text-gray-100">{addr.account_number}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Agreement Card */}
        {!agreementAccepted && !isProfileLocked && (
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Пользовательское соглашение
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-amber-700 dark:text-amber-300">
                Для продолжения работы с сервисом необходимо принять пользовательское соглашение.
              </p>
              
              <div className="flex items-center space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <Checkbox 
                  id="agreement" 
                  checked={agreementAccepted}
                  onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
                />
                <label htmlFor="agreement" className="text-sm text-foreground">
                  Я принимаю{" "}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link" className="p-0 h-auto font-normal text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        пользовательское соглашение
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Пользовательское соглашение
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm text-foreground">
                        <section>
                          <h3 className="font-semibold mb-2">1. Общие положения</h3>
                          <p className="text-muted-foreground">
                            Настоящее Пользовательское соглашение регулирует отношения между пользователем и сервисом. 
                            Использование сервиса означает полное согласие с условиями данного соглашения.
                          </p>
                        </section>
                        
                        <section>
                          <h3 className="font-semibold mb-2">2. Обработка персональных данных</h3>
                          <p className="text-muted-foreground">
                            Пользователь соглашается на обработку своих персональных данных в соответствии с действующим 
                            законодательством. Данные используются исключительно для предоставления услуг сервиса.
                          </p>
                        </section>
                        
                        <section>
                          <h3 className="font-semibold mb-2">3. Ответственность сторон</h3>
                          <p className="text-muted-foreground">
                            Пользователь несет ответственность за достоверность предоставленной информации. 
                            Сервис не несет ответственности за возможные убытки, связанные с использованием платформы.
                          </p>
                        </section>
                        
                        <section>
                          <h3 className="font-semibold mb-2">4. Изменения соглашения</h3>
                          <p className="text-muted-foreground">
                            Администрация оставляет за собой право вносить изменения в данное соглашение. 
                            Пользователи уведомляются об изменениях через интерфейс сервиса.
                          </p>
                        </section>
                      </div>
                    </DialogContent>
                  </Dialog>
                </label>
              </div>
              
              {!agreementAccepted && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Примите соглашение для продолжения заполнения профиля
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Main Form Card */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border-0 overflow-hidden">
          {!isProfileLocked && (
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[1, 2, 3, 4, 5].map((step) => (
                <div 
                  key={step}
                  className={`flex-1 text-center py-4 text-xs font-medium transition-all
                    ${step === currentStep ? 
                      'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' : 
                      step < currentStep ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {step < currentStep && <Check className="h-4 w-4 mx-auto" />}
                  {step === currentStep && <span className="font-semibold">Шаг {step}</span>}
                  {step > currentStep && <span>Шаг {step}</span>}
                </div>
              ))}
            </div>
          )}

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                {isProfileLocked ? "Профиль (завершён)" : getStepTitle()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
