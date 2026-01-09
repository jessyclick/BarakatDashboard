# Схема базы данных для ювелирной мастерской Barakat

## Таблица `orders`

Таблица для хранения заказов на ювелирные изделия.

### Структура таблицы

| Поле | Тип | Описание | Обязательное |
|------|-----|----------|--------------|
| `id` | UUID | Уникальный идентификатор заказа | ✅ |
| `title` | TEXT | Название изделия | ✅ |
| `description` | TEXT | Описание изделия | ❌ |
| `status` | TEXT | Статус производства | ✅ |
| `created_at` | TIMESTAMP | Дата создания заказа | ✅ |
| `user_id` | UUID | ID пользователя (ссылка на auth.users) | ✅ |
| `jewelry_type` | TEXT | Тип ювелирного изделия | ❌ |
| `material` | TEXT | Материал изделия | ❌ |
| `carat` | TEXT | Каратность камней | ❌ |

### Возможные значения статусов

- `design` - Дизайн (создание эскиза)
- `casting` - Литье (отливка изделия)
- `polishing` - Полировка (обработка поверхности)
- `setting` - Закрепка (установка камней)
- `quality_check` - Контроль качества
- `completed` - Готово (изделие завершено)
- `created` - Создан (для обратной совместимости)
- `in_progress` - В работе (для обратной совместимости)

### Возможные типы изделий (jewelry_type)

- Кольцо
- Серьги
- Браслет
- Ожерелье
- Подвеска
- Брошь
- Запонки
- Цепочка
- Кулон

### Возможные материалы (material)

- Белое золото 585
- Белое золото 750
- Желтое золото 585
- Желтое золото 750
- Красное золото 585
- Красное золото 750
- Серебро 925
- Серебро 999
- Платина 950
- Палладий 950

### Примеры данных

```sql
-- Пример заказа на кольцо
INSERT INTO orders (
  user_id,
  title,
  description,
  status,
  jewelry_type,
  material,
  carat
) VALUES (
  'user-uuid-here',
  'Обручальное кольцо с бриллиантами',
  'Классическое обручальное кольцо из белого золота с вставкой из бриллиантов',
  'design',
  'Кольцо',
  'Белое золото 585',
  '0.5'
);

-- Пример заказа на серьги
INSERT INTO orders (
  user_id,
  title,
  description,
  status,
  jewelry_type,
  material,
  carat
) VALUES (
  'user-uuid-here',
  'Серьги-гвоздики с сапфирами',
  'Элегантные серьги-гвоздики из желтого золота с натуральными сапфирами',
  'polishing',
  'Серьги',
  'Желтое золото 750',
  '1.2'
);

-- Пример заказа на браслет
INSERT INTO orders (
  user_id,
  title,
  description,
  status,
  jewelry_type,
  material,
  carat
) VALUES (
  'user-uuid-here',
  'Браслет из платины',
  'Изысканный браслет из платины с гравировкой',
  'completed',
  'Браслет',
  'Платина 950',
  NULL
);
```

### Политики безопасности (RLS)

1. **Users can view their own orders** - Пользователи могут видеть только свои заказы
2. **Users can insert their own orders** - Пользователи могут создавать свои заказы
3. **Users can update their own orders** - Пользователи могут обновлять свои заказы
4. **Admins can view all orders** - Администраторы могут видеть все заказы
5. **Admins can update all orders** - Администраторы могут обновлять все заказы

### Индексы (рекомендуется)

```sql
-- Индекс для быстрого поиска заказов пользователя
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Индекс для сортировки по дате создания
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Индекс для фильтрации по статусу
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
```


