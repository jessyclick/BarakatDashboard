# Инструкция по запуску проекта

## 1. Установка зависимостей

```bash
npm install
```

## 2. Настройка переменных окружения

Создайте файл `.env.local` на основе `.env.example`:

```bash
cp .env.example .env.local
```

Заполните следующие переменные:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (для админ-панели)
```

**Где найти эти ключи:**
- Перейдите в [Supabase Dashboard](https://app.supabase.com)
- Выберите ваш проект → Settings → API
- Скопируйте:
  - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY` и `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ держите в секрете!)

## 3. Создание таблицы orders в базе данных

Выполните следующий SQL в Supabase SQL Editor:

```sql
-- Создание таблицы orders для ювелирных изделий
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'design',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Дополнительные поля для ювелирных изделий
  jewelry_type TEXT, -- Тип изделия: Кольцо, Серьги, Браслет, Ожерелье и т.д.
  material TEXT,     -- Материал: Золото, Серебро, Платина и т.д.
  carat TEXT         -- Каратность камней (например: "0.5", "1.2")
);

-- Включение Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Политика: пользователи могут видеть только свои заказы
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Политика: пользователи могут создавать свои заказы
CREATE POLICY "Users can insert their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Политика: пользователи могут обновлять свои заказы
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

-- Политика: админы могут видеть все заказы
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Политика: админы могут обновлять все заказы
CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
```

### Возможные значения для полей:

**status (статус производства):**
- `design` - Дизайн (создание эскиза)
- `casting` - Литье (отливка изделия)
- `polishing` - Полировка (обработка поверхности)
- `setting` - Закрепка (установка камней)
- `quality_check` - Контроль качества
- `completed` - Готово (изделие завершено)
- `created` - Создан (для обратной совместимости)
- `in_progress` - В работе (для обратной совместимости)

**jewelry_type (тип изделия):**
- Кольцо
- Серьги
- Браслет
- Ожерелье
- Подвеска
- Брошь
- Запонки
- и т.д.

**material (материал):**
- Белое золото 585
- Белое золото 750
- Желтое золото 585
- Желтое золото 750
- Красное золото 585
- Серебро 925
- Платина 950
- и т.д.

**carat (каратность):**
- Строковое значение, например: "0.5", "1.2", "2.5"
- Может быть пустым для изделий без камней

## 4. Запуск проекта

```bash
npm run dev
```

Проект будет доступен по адресу: http://localhost:3000

## 5. (Опционально) Локальная разработка с Supabase

Если хотите запустить Supabase локально:

```bash
# Установите Supabase CLI (если еще не установлен)
npm install -g supabase

# Инициализация (если нужно)
supabase init

# Запуск локального Supabase
supabase start
```

После этого используйте локальные URL и ключи из вывода команды `supabase start`.

## 6. Обновление существующей таблицы

Если таблица `orders` уже существует и нужно добавить новые поля для ювелирных изделий, выполните миграцию:

```sql
-- Файл: supabase/migrations/add_jewelry_fields.sql
-- Или скопируйте SQL из этого файла в Supabase SQL Editor
```

Или выполните SQL напрямую в Supabase SQL Editor:

```sql
-- Добавление новых полей для ювелирных изделий
ALTER TABLE orders ADD COLUMN IF NOT EXISTS jewelry_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS material TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carat TEXT;

-- Обновление значения по умолчанию для status
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'design';
```

Подробную документацию по схеме базы данных см. в файле `DATABASE_SCHEMA.md`.

