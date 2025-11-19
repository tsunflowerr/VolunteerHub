import {
  Heart,
  MessageCircle,
  Reply,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Bell,
} from 'lucide-react';

export const NOTIFICATION_ICONS = {
  like: {
    icon: Heart,
    props: { size: 20, fill: '#ef4444', color: '#ef4444' },
  },
  comment: {
    icon: MessageCircle,
    props: { size: 20, color: '#3b82f6' },
  },
  comment_reply: {
    icon: Reply,
    props: { size: 20, color: '#3b82f6' },
  },
  new_post: {
    icon: FileText,
    props: { size: 20, color: '#3b82f6' },
  },
  event_status_update: {
    default: {
      icon: Calendar,
      props: { size: 20, color: '#3b82f6' },
    },
    cancelled: {
      icon: XCircle,
      props: { size: 20, color: '#000000' },
    },
    completed: {
      icon: CheckCircle,
      props: { size: 20, color: '#344f1f' },
    },
    confirmed: {
      icon: Calendar,
      props: { size: 20, color: '#344f1f' },
    },
  },
  registration_status_update: {
    default: {
      icon: Calendar,
      props: { size: 20, color: '#3b82f6' },
    },
    approved: {
      icon: CheckCircle,
      props: { size: 20, color: '#344f1f' },
    },
    rejected: {
      icon: XCircle,
      props: { size: 20, color: '#000000' },
    },
    pending: {
      icon: Clock,
      props: { size: 20, color: '#f59e0b' },
    },
  },
  default: {
    icon: Bell,
    props: { size: 20, color: '#344f1f' },
  },
};

export const getNotificationIcon = (type, relatedStatus) => {
  const config = NOTIFICATION_ICONS[type];

  if (!config) {
    const DefaultIcon = NOTIFICATION_ICONS.default.icon;
    return <DefaultIcon {...NOTIFICATION_ICONS.default.props} />;
  }

  // Handle types with status-based icons
  if (typeof config === 'object' && config.default) {
    const statusConfig = config[relatedStatus] || config.default;
    const Icon = statusConfig.icon;
    return <Icon {...statusConfig.props} />;
  }

  // Handle simple types
  const Icon = config.icon;
  return <Icon {...config.props} />;
};
