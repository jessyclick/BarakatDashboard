-- Миграция: Добавление полей для ювелирных изделий
-- Если таблица orders уже существует, выполните этот скрипт для добавления новых полей

-- Добавление новых полей (если их еще нет)
DO $$ 
BEGIN
  -- Добавляем поле jewelry_type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'jewelry_type'
  ) THEN
    ALTER TABLE orders ADD COLUMN jewelry_type TEXT;
  END IF;

  -- Добавляем поле material
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'material'
  ) THEN
    ALTER TABLE orders ADD COLUMN material TEXT;
  END IF;

  -- Добавляем поле carat
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'carat'
  ) THEN
    ALTER TABLE orders ADD COLUMN carat TEXT;
  END IF;

  -- Обновляем значение по умолчанию для status
  ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'design';
END $$;

-- Комментарии к полям для документации
COMMENT ON COLUMN orders.jewelry_type IS 'Тип ювелирного изделия: Кольцо, Серьги, Браслет, Ожерелье и т.д.';
COMMENT ON COLUMN orders.material IS 'Материал изделия: Золото, Серебро, Платина и т.д.';
COMMENT ON COLUMN orders.carat IS 'Каратность камней (например: "0.5", "1.2")';


