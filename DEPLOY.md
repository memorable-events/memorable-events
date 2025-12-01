# Deployment Guide

This guide will help you deploy your **memorable events** website for free.

## Architecture
- **Frontend (React)**: Deployed on **Vercel** (Fast, free, and designed for Vite apps).
- **Backend (Flask)**: Deployed on **PythonAnywhere** (Free, supports Python, and keeps your database/files safe).

---

## Part 1: Deploy Backend (PythonAnywhere)

1.  **Sign Up**: Go to [PythonAnywhere](https://www.pythonanywhere.com/) and create a free "Beginner" account.
2.  **Upload Code**:
    *   Go to the **Files** tab.
    *   Upload your `backend` folder contents. You can zip the `backend` folder on your computer, upload `backend.zip`, and then run `unzip backend.zip` in the **Consoles > Bash** tab.
    *   Ensure your file structure looks like: `/home/yourusername/mysite/app.py`.
3.  **Install Dependencies**:
    *   Open a **Bash** console.
    *   Run: `pip3 install -r requirements.txt` (Make sure you uploaded `requirements.txt`).
4.  **Configure Web App**:
    *   Go to the **Web** tab.
    *   Click **Add a new web app**.
    *   Select **Flask** -> **Python 3.10** (or latest).
    *   **Path**: Enter the path to your `app.py` (e.g., `/home/yourusername/mysite/app.py`).
5.  **Environment Variables**:
    *   In the **Web** tab, look for the **WSGI configuration file** link (e.g., `/var/www/yourusername_pythonanywhere_com_wsgi.py`). Click it.
    *   Add your environment variables using `os.environ` at the top of the file, BEFORE importing app:
        ```python
        import os
        os.environ["CLOUDINARY_CLOUD_NAME"] = "your_cloud_name"
        os.environ["CLOUDINARY_API_KEY"] = "your_api_key"
        os.environ["CLOUDINARY_API_SECRET"] = "your_api_secret"
        os.environ["TELEGRAM_BOT_TOKEN"] = "your_bot_token"
        os.environ["TELEGRAM_CHAT_ID"] = "your_chat_id"
        os.environ["IMGBB_API_KEY"] = "your_imgbb_key"
        os.environ["SECRET_KEY"] = "some_random_secret_string"
        os.environ["ADMIN_PASSWORD"] = "your_admin_password"
        
        from app import app as application  # This line should already be there
        ```
6.  **Reload**: Go back to the **Web** tab and click **Reload**.
7.  **Test**: Visit `http://yourusername.pythonanywhere.com/api/content`. You should see JSON data.

---

## Part 2: Deploy Frontend (Vercel)

1.  **Push to GitHub**:
    *   If you haven't already, push your entire project code to a GitHub repository.
2.  **Sign Up/Login**: Go to [Vercel](https://vercel.com/) and login with GitHub.
3.  **Import Project**:
    *   Click **Add New** -> **Project**.
    *   Select your GitHub repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vite (should be auto-detected).
    *   **Root Directory**: `.` (default).
    *   **Environment Variables**:
        *   Name: `VITE_API_URL`
        *   Value: `https://yourusername.pythonanywhere.com/api` (Replace with your actual PythonAnywhere URL).
5.  **Deploy**: Click **Deploy**.

---

## Part 3: Final Check

1.  Open your new Vercel URL (e.g., `https://event-me.vercel.app`).
2.  Check if the **Hero Video** plays.
3.  Try logging into the **Admin Panel**.
4.  Send a test **Inquiry** to verify Telegram notifications.

**Enjoy your live website!** 🚀
