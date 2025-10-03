# **PetFinder**

**PetFinder** — это веб-платформа для помощи в поиске потерянных животных. Проект позволяет пользователям создавать объявления о пропаже питомцев, просматривать доступные объявления в своем районе и отмечать найденных животных.

---

## Основной функционал
- Полная CRUD система для объявлений о пропаже
- JWT аутентификация с защищенными маршрутами
- Загрузка и валидация фотографий (форматы, размер, количество)
- Адаптивный UI с поддержкой мобильных устройств
- Docker контейнеризация - полная изоляция сервисов
- Загрузка файлов - мультизагрузка фото с превью и удалением


## **Основные возможности**
- Регистрация и авторизация с JWT токенами
- Создание и редактирование объявлений о пропаже животных
- Загрузка фотографий питомцев (до 10 фото)
- Поиск и фильтрация объявлений по типу животного, локации, дате
- Система комментариев под объявлениями
- Избранные объявления - возможность сохранять важные объявления
- Личный кабинет с управлением своими объявлениями

## Для администраторов
- Админ-панель для управления пользователями
- Просмотр различной статистики: общее количество пользователей, количество объявлений - активные/неактивные, новые за период, распределение объявлений по видам животных и т.д.
- Редактирование объявлений, а также комментариев

## Дополнительные функции
- Интеграция с Яндекс.Картами - подсказки адресов при создании объявлений для правильного ввода
- Обработка ошибок - централизованная система обработки ошибок
- Темная/светлая тема интерфейса

## **Стек технологий**
- **Бэкенд:** Django REST Framework  
- **Фронтенд:** React (Vite)
- **БД:** PostgreSQL
- **Инфраструктура**: Docker, Docker Compose

## 🚀 Запуск проекта локально

### 1. Клонирование репозитория
```bash
git clone https://github.com/username/petfinder.git
cd petfinder
```

### 2. Настройка переменных окружения
Создайте файл **.env** в папке backend на основе **.env.example** и заполните его, например:
```bash
# Django
DEBUG=True
SECRET_KEY=django
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
POSTGRES_DB=petfinder_db
POSTGRES_USER=petfinder_user
POSTGRES_PASSWORD=petfinder_password
DB_HOST=localhost
DB_PORT=5432

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME_SECONDS=3600
JWT_REFRESH_TOKEN_LIFETIME_SECONDS=86400
JWT_ROTATE_REFRESH_TOKENS=True
JWT_BLACKLIST_AFTER_ROTATION=True
JWT_UPDATE_LAST_LOGIN=True

YANDEX_API_KEY= 
```

YANDEX_API_KEY создайте ключ сами (API Геосаджеста) на сайте [https://developer.tech.yandex.ru/services/](https://developer.tech.yandex.ru/services/)

**Frontend (frontend/.env)**
Cоздайте файл **.env** в папке **frontend** на основе **.env.example** и укажите:
```bash
VITE_API_URL=http://127.0.0.1:8000/api
VITE_MEDIA_URL=http://127.0.0.1:8000
NODE_ENV=development
```

### 3. Установка зависимостей
Фронтенд
```bash
cd frontend
npm install --legacy-peer-deps
```

Бекенд
```bash
cd backend
pip install poetry
poetry install
```

### 4. Запуск проекта
```bash
python start.py
```

### 5. Доступ к сервисам
- **Фронтенд (React):** [http://localhost:3000](http://localhost:3000)  
- **Бэкенд (Django API):** [http://localhost:8000](http://localhost:8000)  


## Запуск проекта через Docker Compose

Заполнить также файлы **.env** в папке **frontend** и **backend** аналогично, только в **backend/.env**
Заменить
```bash
DB_HOST=localhost
```

на

```bash
DB_HOST=db
```

а затем в корне проекта выполнить:

```bash
docker-compose up --build
```

В итоге создается пользователь с правами админа с такими данными:
```bash
admin
1234
```

Структура сервисов
- backend - Django API (порт 8000)
- frontend — React SPA (порт 3000)
- db — PostgreSQL база данных (порт 5432)
