
import React, { useEffect, useState } from "react";
import { Home, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

interface Step {
  label: string;
  completed: boolean;
}

interface AllRepairRequest {
  id: string;
  problem_type: string;
  description: string;
  date: string;       
  time: string;      
  phone: string;     
  steps?: Step[];
}

const AllRepairRequests: React.FC = () => {
  const [requests, setRequests] = useState<AllRepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://best-yard.onrender.com/api/repair-requests");
const contentType = res.headers.get("Content-Type");

if (!res.ok) {
  throw new Error(`Ошибка сервера: ${res.status}`);
}

if (!contentType || !contentType.includes("application/json")) {
  const text = await res.text(); 
  console.error("Ожидался JSON, но пришло:", text);
  throw new Error("Сервер вернул не JSON");
}

const data = await res.json();


      const enriched = data.map((req: AllRepairRequest) => ({
        ...req,
        steps: req.steps || [
          { label: "Принято в работу", completed: false },
          { label: "Назначен мастер", completed: false },
          { label: "Работа завершена", completed: false },
        ],
      }));

      setRequests(enriched);
    } catch (err) {
      console.error("Ошибка загрузки заявок", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const isRequestCompleted = (request: AllRepairRequest): boolean => {
    return request.steps ? request.steps.every(step => step.completed) : false;
  };

  const userId = localStorage.getItem("userId")
  const handleDeleteRequest = async (id: string) => {
  if (!userId) {
    alert("Пользователь не определён");
    return;
  }

  await fetch(`https://best-yard.onrender.com/api/repair-requests/${id}?userId=${userId}`, {
    method: "DELETE",
  });

  setRequests((prev) => prev.filter((r) => r.id !== id));
};

  const handleStepToggle = async (requestId: string, stepIndex: number) => {
    if (!userId) {
      alert("Пользователь не определён");
      return;
    }

    const updatedRequests = requests.map((req) => {
      if (req.id === requestId && req.steps) {
        const currentStep = req.steps[stepIndex];

        if (currentStep.completed) {
          const newSteps = req.steps.map((step, index) => ({
            ...step,
            completed: index < stepIndex
          }));
          
          return {
            ...req,
            steps: newSteps
          };
        } else {

          const canComplete = stepIndex === 0 || req.steps.slice(0, stepIndex).every(step => step.completed);
          
          if (canComplete) {
            const newSteps = req.steps.map((step, index) => ({
              ...step,
              completed: index <= stepIndex ? true : step.completed
            }));
            
            return {
              ...req,
              steps: newSteps
            };
          }
        }
      }
      return req;
    });

    const updatedRequest = updatedRequests.find((r) => r.id === requestId);

    if (updatedRequest) {
      try {
        const response = await fetch(`https://best-yard.onrender.com/api/repair-requests/${requestId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            steps: updatedRequest.steps,
            userId: userId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Ошибка сохранения этапов: ${response.status}`);
        }

        console.log("Этапы успешно сохранены в БД");
        setRequests(updatedRequests);
      } catch (error) {
        console.error("Ошибка обновления этапа:", error);
        alert("Ошибка при сохранении этапов в базе данных");
      }
    }
  };

  const handleToggleCompleted = async (id: string, currentCompleted: boolean) => {
    if (!userId) {
      alert("Пользователь не определён");
      return;
    }

    const updatedRequests = requests.map((req) => {
      if (req.id === id) {
        const updatedSteps = req.steps?.map((step, index) => {
          if (!currentCompleted) return { ...step, completed: true };
          return { ...step, completed: index === 0 };
        }) || [];

        return {
          ...req,
          steps: updatedSteps
        };
      }
      return req;
    });

    const updated = updatedRequests.find((r) => r.id === id);

    try {
      const response = await fetch(`https://best-yard.onrender.com/api/repair-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: updated?.steps,
          userId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка обновления заявки: ${response.status}`);
      }

      setRequests(updatedRequests);
    } catch (error) {
      console.error("Ошибка при обновлении заявки:", error);
      alert("Ошибка при сохранении в базе данных");
    }
  };

  const handleBackToMain = () => {
    navigate("/");
  };

  const pendingRequests = requests.filter((r) => !isRequestCompleted(r));
  const completedRequests = requests.filter((r) => isRequestCompleted(r));

  const renderSteps = (steps: Step[] | undefined, requestId: string) =>
    steps && steps.length > 0 && (
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2">Этапы выполнения:</h4>
        <ul className="space-y-2">
          {steps.map((step, i) => {
            const canToggle = i === 0 || steps.slice(0, i).every(s => s.completed);
            const isClickable = step.completed || canToggle;
            
            return (
              <li key={i} className="flex items-center space-x-2">
                <Checkbox 
                  checked={step.completed} 
                  disabled={!isClickable}
                  onClick={() => isClickable && handleStepToggle(requestId, i)}
                  className={`border-gray-400 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                />
                <span 
                  className={`${
                    step.completed 
                      ? "text-green-400 line-through" 
                      : isClickable 
                        ? "text-gray-300 cursor-pointer hover:text-white" 
                        : "text-gray-500"
                  }`}
                  onClick={() => isClickable && handleStepToggle(requestId, i)}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );

  const renderCard = (request: AllRepairRequest, isCompleted: boolean) => {
  return (
    <Card
      key={request.id}
      className={`overflow-hidden bg-gray-700 border-gray-600 ${isCompleted ? "opacity-75" : ""}`}
    >
      <CardHeader
        className={`text-white ${
          isCompleted
            ? "bg-gradient-to-r from-green-500 to-blue-500"
            : "bg-gradient-to-r from-orange-500 to-red-600"
        }`}
      >
        <CardTitle className="text-base md:text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            {isCompleted && <Check className="h-5 w-5" />}
            {request.problem_type}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleToggleCompleted(request.id, isCompleted)}
              className={`${
                isCompleted
                  ? "bg-orange-600 hover:bg-orange-700 border-orange-500"
                  : "bg-green-600 hover:bg-green-700 border-green-500"
              } text-white`}
            >
              {isCompleted ? "Сбросить все" : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Завершить все
                </>
              )}
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-1">Описание проблемы:</h4>
            <p className="text-gray-300 leading-relaxed">{request.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
  <h4 className="text-sm font-semibold text-gray-400 mb-1">Дата заявки:</h4>
  <p className="text-gray-300">{new Date(request.date).toLocaleDateString("ru-RU")}</p>
</div>
    <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Время:</h4>
              <p className="text-gray-300">{request.time || "Не указано"}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-1">Телефон:</h4>
              <p className="text-gray-300">{request.phone || "Не указан"}</p>
            </div>
          </div>
          {renderSteps(request.steps, request.id)}
        </div>
      </CardContent>
    </Card>
  );
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Все заявки на ремонт</h1>
        <Button variant="outline" onClick={handleBackToMain} className="self-start sm:self-auto">
          <Home className="mr-2 h-4 w-4" />
          На главную
        </Button>
      </div>

      {loading && <div className="text-center text-white">Загрузка заявок...</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-600 border-blue-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{requests.length}</div>
            <div className="text-blue-100">Всего заявок</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-600 border-orange-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{pendingRequests.length}</div>
            <div className="text-orange-100">В ожидании</div>
          </CardContent>
        </Card>
        <Card className="bg-green-600 border-green-500">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-white">{completedRequests.length}</div>
            <div className="text-green-100">Выполнено</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
          Заявки в ожидании ({pendingRequests.length})
        </h2>
        {pendingRequests.map((r) => renderCard(r, false))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
          Выполненные заявки ({completedRequests.length})
        </h2>
        {completedRequests.map((r) => renderCard(r, true))}
      </div>

      {requests.length === 0 && !loading && (
        <Card className="bg-gray-700 border-gray-600">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-400">Заявок на ремонт пока нет</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllRepairRequests;
