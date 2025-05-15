import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const News = () => {
  const [news, setNews] = useState([]);
  const [isSpecialUser, setIsSpecialUser] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newTag, setNewTag] = useState(""); // 👈 добавили состояние для тега
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
        tag: newTag, // 👈 отправляем тег на сервер
        userId,
      });

      console.log("✅ Ответ сервера:", response.data);
      setNewTitle("");
      setNewContent("");
      setNewTag(""); // 👈 очищаем тег после отправки
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Новости</h1>

      {isSpecialUser && (
        <div className="mb-6 p-4 border rounded-lg shadow">
          <h2 className="text-lg font-semibold">Добавить новость</h2>
          <Input
            placeholder="Заголовок новости"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="mt-2"
          />
          <Textarea
            placeholder="Текст новости"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="mt-2"
          />
          <select
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            className="mt-2 p-2 border rounded w-full"
          >
            <option value="">Без тега</option>
            <option value="#СРОЧНО">#СРОЧНО</option>
          </select>
          <Button onClick={handleAddNews} className="mt-3" disabled={loading}>
            {loading ? "Добавление..." : "Добавить новость"}
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {news.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
  {isSpecialUser && item.tag && (
    <span className="text-red-500 mr-2">{item.tag}</span>
  )}
  {item.title}
</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{item.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(item.created_at).toLocaleString("ru-RU")}
              </p>
              {isSpecialUser && (
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteNews(item.id)}
                  className="mt-2"
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
