-- Create notifications system
-- Migration: 061_create_notifications_system.sql

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat', 'order', 'inventory', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
TO authenticated
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  VALUES (p_user_id, p_type, p_title, p_message, p_link)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to send notification to all admins
CREATE OR REPLACE FUNCTION notify_admins(
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, link)
  SELECT id, p_type, p_title, p_message, p_link
  FROM users
  WHERE role = 'admin';
END;
$$;

-- Trigger to send notification when new order is created
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM notify_admins(
    'order',
    'New Order Created',
    'Order #' || NEW.id || ' has been placed',
    '/dashboard/track-orders'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_new_order
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_new_order();

-- Trigger to send notification when inventory is low
CREATE OR REPLACE FUNCTION notify_low_stock()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.quantity <= NEW.reorder_level AND NEW.quantity > 0 THEN
    PERFORM notify_admins(
      'inventory',
      'Low Stock Alert',
      'Product "' || NEW.name || '" is running low (Qty: ' || NEW.quantity || ')',
      '/dashboard/inventory/low-stock'
    );
  END IF;
  
  IF NEW.quantity = 0 THEN
    PERFORM notify_admins(
      'inventory',
      'Out of Stock Alert',
      'Product "' || NEW.name || '" is out of stock',
      '/dashboard/inventory/out-of-stock'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_notify_low_stock
AFTER UPDATE OF quantity ON products_unified
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION notify_low_stock();

-- Function to clean old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = TRUE;
END;
$$;

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Comments
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON FUNCTION create_notification IS 'Helper function to create a notification for a specific user';
COMMENT ON FUNCTION notify_admins IS 'Helper function to send notification to all admin users';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Clean up read notifications older than 30 days';
