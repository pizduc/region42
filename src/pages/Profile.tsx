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
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-center">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
              <p className="text-green-800 dark:text-green-200">
                Профиль завершён и заблокирован для редактирования
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium text-foreground">Фамилия:</span>
                <span className="text-foreground">{lastName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium text-foreground">Имя:</span>
                <span className="text-foreground">{firstName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium text-foreground">Отчество:</span>
                <span className="text-foreground">{middleName}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium text-foreground">Телефон:</span>
                <span className="text-foreground">{phone}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm font-medium text-foreground">Email:</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground">{email}</span>
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
                    <label htmlFor={id} className="text-sm font-medium">{label}</label>
                    <Input
                      id={id}
                      value={value}
                      onFocus={() => setActiveField(id)}
                      onChange={(e) => {
                        setValue(e.target.value);
                        fetchSuggestions(e.target.value);
                      }}
                      placeholder={`Введите ${label.toLowerCase()}`}
                    />
                    {activeField === id && suggestions.length > 0 && (
                      <ul className="absolute z-10 bg-background border shadow rounded w-full mt-1 max-h-40 overflow-y-auto">
                        {suggestions.map((s, i) => (
                          <li
                            key={i}
                            onClick={() => applySuggestion(s.value)}
                            className="px-3 py-1 cursor-pointer hover:bg-accent"
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
            <Button onClick={handleNextStep} className="w-full" disabled={!agreementAccepted}>
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 2:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Номер телефона</label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full">
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 3:
        return (
          <>
            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
            </div>
            <Button onClick={handleNextStep} className="w-full">
              Продолжить <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        );
      
      case 4:
        return (
          <>
            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">Подтвердите ваш email адрес</p>
              
              {codeSent ? (
                <div className="space-y-2">
                  <label htmlFor="emailCode" className="text-sm font-medium">Введите код подтверждения</label>
                  <Input
                    id="emailCode"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value)}
                    placeholder="Введите код"
                  />
                  <Button 
                    onClick={verifyEmailCode} 
                    className="w-full mt-2"
                    disabled={!emailCode}
                  >
                    Подтвердить код
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={sendEmailCode} 
                  className="w-full mt-2"
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
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-200">
                  Все данные заполнены и подтверждены
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-foreground">Фамилия:</span>
                  <span className="text-foreground">{lastName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-foreground">Имя:</span>
                  <span className="text-foreground">{firstName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-foreground">Отчество:</span>
                  <span className="text-foreground">{middleName}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-foreground">Телефон:</span>
                  <span className="text-foreground">{phone}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-sm font-medium text-foreground">Email:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground">{email}</span>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Подтвержден
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {savedSuccessfully ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <p className="text-green-800 dark:text-green-200 font-medium">
                  Данные успешно сохранены
                </p>
              </div>
            ) : (
              <Button 
                onClick={handleSave} 
                className="w-full"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToMain}>
            <Home className="mr-2 h-4 w-4" />
            На главную
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </div>

      {userAddresses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Адреса пользователя</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userAddresses.map((addr, idx) => (
              <div key={idx} className="border rounded p-3 bg-muted">
                <p><span className="font-medium">Город:</span> {addr.city}</p>
                <p><span className="font-medium">Улица:</span> {addr.street}</p>
                <p><span className="font-medium">Дом:</span> {addr.house}</p>
                <p><span className="font-medium">Квартира:</span> {addr.apartment}</p>
                <p><span className="font-medium">Номер договора:</span> {addr.contract_number}</p>
                {addr.account_number && (
                  <p><span className="font-medium">Лицевой счёт:</span> {addr.account_number}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {!agreementAccepted && !isProfileLocked && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">Пользовательское соглашение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Для продолжения работы с сервисом необходимо принять пользовательское соглашение.
            </p>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agreement" 
                checked={agreementAccepted}
                onCheckedChange={(checked) => setAgreementAccepted(checked === true)}
              />
              <label htmlFor="agreement" className="text-sm text-foreground">
                Я принимаю{" "}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="link" className="p-0 h-auto font-normal text-primary hover:text-primary/80">
                      пользовательское соглашение
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

      <div className="bg-background shadow-sm rounded-lg overflow-hidden">
        {!isProfileLocked && (
          <div className="flex border-b border-border">
            {[1, 2, 3, 4, 5].map((step) => (
              <div 
                key={step}
                className={`flex-1 text-center py-3 text-xs font-medium
                  ${step === currentStep ? 
                    'bg-primary text-primary-foreground' : 
                    step < currentStep ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-muted text-muted-foreground'
                  }
                  ${step === 1 ? 'rounded-tl-lg' : ''}
                  ${step === 5 ? 'rounded-tr-lg' : ''}
                `}
              >
                {step < currentStep && <Check className="h-4 w-4 mx-auto" />}
                {step === currentStep && <span>Шаг {step}</span>}
                {step > currentStep && <span>Шаг {step}</span>}
              </div>
            ))}
          </div>
        )}

        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle>
              {isProfileLocked ? "Профиль (завершён)" : getStepTitle()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
