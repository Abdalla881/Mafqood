import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Check, X, Phone, MessageCircle, Calendar, MapPin } from 'lucide-react';

interface ChatMessage {
  id: number;
  sender: 'user' | 'other';
  message: string;
  timestamp: string;
  read: boolean;
}

interface MatchedItem {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  date: string;
  type: 'lost' | 'found';
}

export const MatchChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [matchAccepted, setMatchAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock matched items
  const lostItem: MatchedItem = {
    id: 1,
    title: 'محفظة جلدية سوداء',
    description: 'محفظة جلدية سوداء تحتوي على بطاقة الهوية وبعض البطاقات البنكية',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
    location: 'وسط البلد، القاهرة',
    date: '2024-01-15',
    type: 'lost'
  };

  const foundItem: MatchedItem = {
    id: 2,
    title: 'محفظة موجودة في المترو',
    description: 'تم العثور على محفظة جلدية في محطة مترو السادات',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=200&fit=crop',
    location: 'محطة السادات، القاهرة',
    date: '2024-01-16',
    type: 'found'
  };

  // Mock chat messages
  const initialMessages: ChatMessage[] = [
    {
      id: 1,
      sender: 'other',
      message: 'السلام عليكم، أعتقد أنني وجدت المحفظة التي تبحث عنها',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: true
    },
    {
      id: 2,
      sender: 'user',
      message: 'وعليكم السلام، هل يمكنك وصف المحفظة؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 300000).toISOString(),
      read: true
    },
    {
      id: 3,
      sender: 'other',
      message: 'محفظة جلدية سوداء، بها بطاقة هوية باسم أحمد محمد',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 600000).toISOString(),
      read: true
    },
    {
      id: 4,
      sender: 'user',
      message: 'نعم! هذا اسمي. أين وجدتها بالضبط؟',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 900000).toISOString(),
      read: true
    },
    {
      id: 5,
      sender: 'other',
      message: 'وجدتها في محطة مترو السادات. متى يمكنك الحضور لاستلامها؟',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      read: true
    }
  ];

  useEffect(() => {
    setMessages(initialMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAcceptMatch = () => {
    setMatchAccepted(true);
    const acceptMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: 'تم قبول المطابقة! شكراً لك على العثور على محفظتي. متى يمكننا الاتفاق على موعد للاستلام؟',
      timestamp: new Date().toISOString(),
      read: true
    };
    setMessages(prev => [...prev, acceptMessage]);
  };

  const handleRejectMatch = () => {
    const rejectMessage: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: 'شكراً لك، ولكن هذه ليست محفظتي. أعتذر عن الإزعاج.',
      timestamp: new Date().toISOString(),
      read: true
    };
    setMessages(prev => [...prev, rejectMessage]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    const message: ChatMessage = {
      id: messages.length + 1,
      sender: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate response after a delay
    setTimeout(() => {
      const responses = [
        'شكراً للرسالة، سأرد عليك قريباً',
        'موافق، سنتواصل لتحديد الموعد المناسب',
        'ممتاز، أتطلع للقائك',
        'حسناً، شكراً لتفهمك'
      ];
      
      const responseMessage: ChatMessage = {
        id: messages.length + 2,
        sender: 'other',
        message: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
        read: false
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-arabic mb-2">المطابقة والمحادثة</h1>
          <p className="text-muted-foreground font-arabic">
            تفاعل مع الأشخاص الذين عثروا على الأشياء المفقودة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matched Items */}
          <div className="lg:col-span-1">
            <Card className="shadow-card mb-6">
              <CardHeader>
                <CardTitle className="font-arabic">تطابق محتمل</CardTitle>
                <CardDescription className="font-arabic">
                  مقارنة بين الشيء المفقود والموجود
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Lost Item */}
                <div className="border border-destructive rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="destructive" className="font-arabic">مفقود</Badge>
                  </div>
                  <img
                    src={lostItem.image}
                    alt={lostItem.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold text-foreground font-arabic mb-2">{lostItem.title}</h3>
                  <p className="text-sm text-muted-foreground font-arabic mb-2">
                    {lostItem.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="font-arabic">{lostItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-arabic">{new Date(lostItem.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                {/* VS Divider */}
                <div className="text-center">
                  <Badge variant="outline" className="font-arabic">مقابل</Badge>
                </div>

                {/* Found Item */}
                <div className="border border-primary rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default" className="font-arabic">موجود</Badge>
                  </div>
                  <img
                    src={foundItem.image}
                    alt={foundItem.title}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-semibold text-foreground font-arabic mb-2">{foundItem.title}</h3>
                  <p className="text-sm text-muted-foreground font-arabic mb-2">
                    {foundItem.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="font-arabic">{foundItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-arabic">{new Date(foundItem.date).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                {/* Match Actions */}
                {!matchAccepted && (
                  <div className="flex gap-2">
                    <Button onClick={handleAcceptMatch} className="flex-1 font-arabic">
                      <Check className="w-4 h-4 ml-2" />
                      قبول المطابقة
                    </Button>
                    <Button onClick={handleRejectMatch} variant="outline" className="flex-1 font-arabic">
                      <X className="w-4 h-4 ml-2" />
                      رفض
                    </Button>
                  </div>
                )}

                {matchAccepted && (
                  <div className="bg-success-foreground border border-success rounded-lg p-4 text-center">
                    <Check className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-success font-arabic font-semibold">تم قبول المطابقة!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-card h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-arabic">محادثة مع أحمد علي</CardTitle>
                    <CardDescription className="font-arabic">
                      آخر ظهور منذ 5 دقائق
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground ml-auto'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm font-arabic">{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا..."
                    className="flex-1 font-arabic"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    disabled={loading}
                  />
                  <Button onClick={handleSendMessage} disabled={loading || !newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};