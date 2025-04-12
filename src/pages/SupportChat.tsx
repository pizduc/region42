import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
}

const SupportChat = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Здравствуйте! Чем мы можем вам помочь?',
      sender: 'support',
      timestamp: new Date()
    }
  ]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");

    // Simulate sending the user message to the AI for a response
    try {
      const response = await fetch("/api/chat", { // Замените на свой API для общения с ИИ
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await response.json();

      // Получаем ответ от бота
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply, // Ответ от ИИ
        sender: 'support',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, supportMessage]);

      toast({
        title: "Новое сообщение",
        description: "Вы получили ответ от поддержки",
      });
    } catch (error) {
      console.error("Ошибка при общении с AI:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Извините, произошла ошибка. Попробуйте позже.",
        sender: 'support',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Чат с поддержкой</h1>
        <Button variant="outline" onClick={handleBackToMain}>
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <CardHeader className="bg-primary/10 pb-3">
            <CardTitle>Онлайн поддержка</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            <div className="h-[400px] overflow-y-auto space-y-4 p-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
              <Button type="submit">
                <Send className="h-4 w-4 mr-1" />
                Отправить
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SupportChat;
