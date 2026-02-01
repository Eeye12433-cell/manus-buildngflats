import { useState } from "react";
import { AIChatBox, Message } from "./AIChatBox";
import { trpc } from "@/lib/trpc";
import { Button } from "./ui/button";
import { MessageSquare, X } from "lucide-react";

export function AppChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", content: "You are a helpful assistant for the Building Management System. You can help with apartment information, payments, and fees." },
    { role: "assistant", content: "مرحباً! كيف يمكنني مساعدتك اليوم في إدارة العمارة؟" }
  ]);

  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: response
      }]);
    },
  });

  const handleSend = (content: string) => {
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    chatMutation.mutate({ messages: newMessages });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-[350px] md:w-[400px] flex flex-col shadow-2xl rounded-lg overflow-hidden border bg-background animate-in slide-in-from-bottom-4">
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">مساعد إدارة العمارة</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="hover:bg-primary-foreground/10 text-primary-foreground">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={chatMutation.isPending}
            height="500px"
            placeholder="اسألني أي شيء..."
            emptyStateMessage="ابدأ المحادثة مع المساعد الذكي"
            suggestedPrompts={[
              "كيف يمكنني تسجيل دفعة؟",
              "عرض ملخص حالة العمارة",
              "ما هي الرسوم المتاحة؟"
            ]}
          />
        </div>
      ) : (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
