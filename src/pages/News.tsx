
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface NewsItem {
  id: string;
  title: string;
  content: string;
  tag?: string;
  created_at: string;
}

const News = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsSpecialUser(localStorage.getItem("isSpecialUser") === "true");
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get("https://best-yard.onrender.com/api/news");
      setNews(response.data);
    } catch (error) {
      console.error("Ошибка загрузки новостей:", error);
    }
  };

  const handleAddNews = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("❌ userId не найден в localStorage!");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("https://best-yard.onrender.com/api/news", {
        title: newTitle,
        content: newContent,
        tag: newTag,
        userId,
      });

      console.log("✅ Ответ сервера:", response.data);
      setNewTitle("");
      setNewContent("");
      setNewTag("");
      fetchNews();
    } catch (error) {
      console.error("❌ Ошибка при добавлении новости:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId: string) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("❌ userId не найден в localStorage!");
      return;
    }

    try {
      const response = await axios.delete(`https://best-yard.onrender.com/api/news/${newsId}?userId=${userId}`);
      if (response.data.success) {
        console.log("✅ Новость удалена");
        setNews(news.filter((item) => item.id !== newsId));
      }
    } catch (error) {
      console.error("❌ Ошибка при удалении новости:", error.response?.data || error.message);
    }
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Новости</h1>
        <Button variant="outline" onClick={handleBackToMain} className="self-start sm:self-auto">
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>

      {isSpecialUser && (
        <Card className="overflow-hidden bg-gray-700 border-gray-600">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardTitle className="text-base md:text-lg">
              Добавить новость
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 pb-4 space-y-4">
            <Input
              placeholder="Заголовок новости"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
            />
            <Textarea
              placeholder="Текст новости"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
            />
            <select
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
            >
              <option value="">Без тега</option>
              <option value="#СРОЧНО">#СРОЧНО</option>
            </select>
            <Button 
              onClick={handleAddNews} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" 
              disabled={loading}
            >
              {loading ? "Добавление..." : "Добавить новость"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {news.map((item) => (
          <Card key={item.id} className="overflow-hidden bg-gray-700 border-gray-600">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <CardTitle className="text-base md:text-lg">
                {isSpecialUser && item.tag && (
                  <span className="inline-block bg-red-500 text-white px-2 py-1 rounded text-sm mr-2">
                    {item.tag}
                  </span>
                )}
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 pb-4">
              <p className="text-gray-300 mb-4 leading-relaxed">{item.content}</p>
              <p className="text-xs text-gray-500 mb-3">
                {new Date(item.created_at).toLocaleString("ru-RU")}
              </p>
              {isSpecialUser && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteNews(item.id)}
                  size="sm"
                >
                  Удалить новость
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default News;
