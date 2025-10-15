import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Eye, Trash2, CheckCircle, AlertCircle, MessageCircle, Search } from 'lucide-react';
import axios from 'axios';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'match' | 'message' | 'system' | 'success';
  read: boolean;
  date: string;
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock notifications using JSONPlaceholder comments
        const response = await axios.get('https://jsonplaceholder.typicode.com/comments?_limit=12');
        
        const mockNotifications: Notification[] = response.data.map((comment: any, index: number) => {
          const types = ['match', 'message', 'system', 'success'];
          const arabicTitles = [
            'تم العثور على تطابق محتمل',
            'رسالة جديدة',
            'تحديث في النظام',
            'تم حل البلاغ بنجاح'
          ];
          
          const type = types[index % 4] as 'match' | 'message' | 'system' | 'success';
          
          return {
            id: comment.id,
            title: arabicTitles[index % 4],
            message: getArabicMessage(type, comment.body.slice(0, 100)),
            type,
            read: Math.random() > 0.6,
            date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          };
        });
        
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const getArabicMessage = (type: string, originalMessage: string) => {
    switch (type) {
      case 'match':
        return 'تم العثور على عنصر قد يطابق البلاغ الذي أضفته. يرجى مراجعة التفاصيل للتأكد من التطابق.';
      case 'message':
        return 'تلقيت رسالة جديدة من مستخدم آخر بخصوص أحد البلاغات. انقر للاطلاع على الرسالة.';
      case 'system':
        return 'تم تحديث النظام بميزات جديدة لتحسين تجربة البحث عن المفقودات.';
      case 'success':
        return 'تهانينا! تم حل البلاغ الخاص بك بنجاح وتم إعادة العنصر المفقود لصاحبه.';
      default:
        return originalMessage;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Search className="w-5 h-5 text-primary" />;
      case 'message':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'system':
        return <AlertCircle className="w-5 h-5 text-warning" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'match':
        return <Badge variant="default" className="font-arabic">تطابق</Badge>;
      case 'message':
        return <Badge variant="secondary" className="font-arabic">رسالة</Badge>;
      case 'system':
        return <Badge variant="outline" className="font-arabic">نظام</Badge>;
      case 'success':
        return <Badge className="bg-success font-arabic">نجاح</Badge>;
      default:
        return null;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== id)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-arabic mb-2">الإشعارات</h1>
              <p className="text-muted-foreground font-arabic">
                تابع آخر التحديثات والرسائل المتعلقةببلاغاتك
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="font-arabic">
                  {unreadCount} غير مقروء
                </Badge>
              )}
              <Button variant="outline" onClick={markAllAsRead} className="font-arabic">
                تحديد الكل كمقروء
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading ? (
            [...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-16 text-center">
                <Bell className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground font-arabic mb-2">
                  لا توجد إشعارات
                </h3>
                <p className="text-muted-foreground font-arabic">
                  ستظهر هنا جميع الإشعارات المتعلقة ببلاغاتك والرسائل
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`shadow-card hover:shadow-hover transition-all cursor-pointer ${
                  !notification.read ? 'ring-2 ring-primary/20 bg-primary-light/10' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-semibold font-arabic ${
                          !notification.read ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {notification.title}
                        </h3>
                        {getNotificationBadge(notification.type)}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                      
                      <p className="text-muted-foreground font-arabic text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground font-arabic">
                        {new Date(notification.date).toLocaleString('ar-EG')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};