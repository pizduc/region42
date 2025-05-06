import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const userAddress = JSON.parse(localStorage.getItem("userAddress") || "{}");
  const userId = localStorage.getItem("userId");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");

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
    if (!userId) return;
    fetch(`https://best-yard.onrender.com/api/user/profile/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const { last_name, first_name, middle_name, phone, email } = data;
        setLastName(last_name || "");
        setFirstName(first_name || "");
        setMiddleName(middle_name || "");
        setPhone(phone || "");
        setEmail(email || "");
      })
      .catch(() => {
        console.log("Профиль не найден — можно заполнить");
      });
  }, [userId]);

  const handleSave = () => {
    if (!userId) {
      toast({
        title: "Ошибка",
        description: "Не найден user_id в localStorage",
      });
      return;
    }

    const userInfo = {
      userId,
      lastName,
      firstName,
      middleName,
      phone,
      email,
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
      })
      .catch((error) => {
        console.error("Ошибка:", error);
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
    let value = e.target.value;

    // Убираем все символы, кроме цифр
    value = value.replace(/[^\d]/g, '');

    // Добавляем префикс +7, если его нет
    if (!value.startsWith("7")) {
      value = "7" + value;
    }

    // Форматируем номер телефона в стиль +7 (___) ___-__-__
    if (value.length <= 1) {
      value = "+7";
    } else if (value.length <= 4) {
      value = "+7 (" + value.slice(1, 4);
    } else if (value.length <= 7) {
      value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4, 7);
    } else if (value.length <= 9) {
      value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4, 7) + "-" + value.slice(7, 9);
    } else if (value.length <= 11) {
      value = "+7 (" + value.slice(1, 4) + ") " + value.slice(4, 7) + "-" + value.slice(7, 9) + "-" + value.slice(9, 11);
    }

    setPhone(value);
  };

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>Данные пользователя</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><span className="font-medium">Город:</span> {userAddress.city}</p>
          <p><span className="font-medium">Улица:</span> {userAddress.street}</p>
          <p><span className="font-medium">Дом:</span> {userAddress.house}</p>
          <p><span className="font-medium">Квартира:</span> {userAddress.apartment}</p>
          <p><span className="font-medium">Номер договора:</span> {userAddress.contract}</p>
          {userAddress.accountNumber && (
            <p><span className="font-medium">Лицевой счет:</span> {userAddress.accountNumber}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Личная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[{
              id: "lastName",
              label: "Фамилия",
              value: lastName,
              setValue: setLastName
            }, {
              id: "firstName",
              label: "Имя",
              value: firstName,
              setValue: setFirstName
            }, {
              id: "middleName",
              label: "Отчество",
              value: middleName,
              setValue: setMiddleName
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
                  <ul className="absolute z-10 bg-white border shadow rounded w-full mt-1 max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        onClick={() => applySuggestion(s.value)}
                        className="px-3 py-1 cursor-pointer hover:bg-gray-100"
                      >
                        {s.value}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

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

          <Button onClick={handleSave} className="w-full">Сохранить</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
