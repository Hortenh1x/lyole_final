from flask import Flask, render_template, jsonify, request, redirect, flash, g, url_for, session
import sqlite3
import random
import json
import os
from functools import wraps
from PIL import Image
from mimetypes import guess_type
from io import BytesIO
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'key'

ROLES = ("user", "moderator", "admin")
DEFAULT_ROLE = "user"

DB_DIR = os.path.join(os.path.dirname(__file__), 'instance')
os.makedirs(DB_DIR, exist_ok=True)
DB_PATH = os.path.join(DB_DIR, 'lyole.db')

def get_db():
    if 'db' not in g:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        g.db = conn
    return g.db

def get_user_by_id(user_id: int):
    db = get_db()
    user = db.execute(
        "SELECT id, username, email, role FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()
    return user

def get_user_by_username(username: str):
    db = get_db()
    user = db.execute(
        "SELECT id, username, email, role FROM users WHERE id = ?",
        (username,)
    ).fetchone()
    return user

def create_user(username: str, email: str, password: str, role: str = DEFAULT_ROLE):
    db = get_db()
    username = (username or "").strip().lower()
    email = (email or "").strip().lower()
    password_hash = generate_password_hash(password)
    db.execute(
        "INSSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
        (username, email, password_hash, role)
    )
    db.commit()

@app.before_request
def load_current_user():
    user_id = session.get("user_id")
    g.user = get_user_by_id(user_id) if user_id else None

def current_author_name() -> str:
    return g.user['username'] if g.user else 'Anonymous'    

@app.teardown_appcontext
def close_db(exc):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.execute('''
        CREATE TABLE IF NOT EXISTS letters (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                text TEXT NOT NULL,
                author TEXT NOT NULL
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS photos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                img_data BLOB NOT NULL,
                author TEXT NOT NULL,
                desc TEXT
        )
    ''')

    cur.execute('''
        CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cur.execute('CREATE UNIQUE INDEX IF NOT EXISTS ux_users_username ON users(username)')
    cur.execute('CREATE UNIQUE INDEX IF NOT EXISTS ux_users_email ON users(email)')

    conn.commit()
    conn.close()

init_db()


with open("compliments.json", encoding="utf-8") as f:
    data = f.read().strip()
    if not data:
        raise ValueError("Файл compliments.json пуст")
    compliments = json.loads(data)

shown_compliments = set()

@app.route("/")
@app.route("/index")
def index():
    return render_template('index.html')


@app.route("/letters/stored")
def stored_letters():
    db = get_db()
    rows = db.execute(
        "SELECT id, title, text, author FROM letters ORDER BY id DESC"
        ).fetchall()
    return render_template('stored_letters.html', stored_letters=rows)


@app.route("/letters", methods=['POST', 'GET'])
def letters():
    if request.method == 'POST':
        title = request.form.get('title')
        text = request.form.get('text')
        
        if text:
            db = get_db()
            try:
                db.execute(
                    "INSERT INTO letters (title, text, author) VALUES (?, ?, ?)",
                    (title, text, current_author_name)
                )
                db.commit()
                flash('Успешно отправлено')
                    
            except Exception as e:
                try:
                    db.rollback()
                except Exception:
                    pass
                flash('Ошибка при сохранении в базу данных')
                print(f"Ошибка базы данных: {e}")
        else:
            flash('Введи текст пж')
        
        return redirect('/letters')
    else:
        return render_template('letters.html')
    

@app.route("/photos", methods=['POST', 'GET'])
def photos():
    if request.method == 'POST':
        file = request.files.get('img_data')
        desc = request.form.get('desc')
        
        if not (file and file.filename):
            flash('выбери файл')
            return redirect('/photos')

        
        img_data = file.read()
        try:
            Image.open(BytesIO(img_data)).verify()
        except Exception as img_err:
            flash('это не картинка')
            print(f"Ошибка обработки изображения: {img_err}")
            return redirect('/photos')
        
        name = file.filename
        db = get_db()
        try:
            db.execute(
                "INSERT INTO photos (name, img_data, author, desc) VALUES (?, ?, ?, ?)",
                (name, sqlite3.Binary(img_data), current_author_name, desc)
            )
            db.commit()
            flash('Успешно отправлено')
        except Exception as e:
            try:
                db.rollback()
            except Exception:
                pass
            flash('Ошибка при сохранении в базу данных')
            print(f"Ошибка базы данных: {e}")
        
        return redirect('/photos')
    
    return render_template('photos.html')
    

@app.route("/photos/stored")
def stored_photos():
    db = get_db()
    rows = db.execute(
        "SELECT id, name, author, desc FROM photos ORDER BY id DESC"
    ).fetchall()
    return render_template('stored_photos.html', stored_photos=rows)


@app.route('/photos/<int:photo_id>')
def photo_data(photo_id):
    db = get_db()
    row = db.execute(
        "SELECT img_data, name FROM photos WHERE id = ?",
        (photo_id,)
    ).fetchone()

    if row is None:
        from flask import abort
        abort(404)

    mime_type = guess_type(row['name'])[0] or 'application/octet-stream'
    return app.response_class(row['img_data'], mimetype=mime_type)

@app.route('/photo/view/<int:photo_id>')
def photo_view(photo_id):
    db = get_db()
    row = db.execute(
        "SELECT id, name, author, desc FROM photos WHERE id = ?",
        (photo_id,)
    ).fetchone()

    if row is None:
        from flask import abort
        abort(404)

    return render_template('photo_view.html', photo=row)

@app.route("/mood")
def mood():
    return render_template('mood.html')


@app.route("/get_compliment")
def get_compliment():
    remaining = list(set(compliments) - shown_compliments)
    
    if not remaining:
        shown_compliments.clear()
        remaining = compliments.copy()

    compliment = random.choice(remaining)
    shown_compliments.add(compliment)
    return jsonify({"compliment": compliment})

@app.route("auth/register", methods=["GET", "POST"])
def auth_register():
    if request.method == "POST":
        username = (request.form.get("username") or "").strip().lower()
        email = (request.form.get("email") or "").strip().lower()
        password = request.form.get("password") or ""
        password2 = request.form.get(password2) or ""


@app.route('/db_permission_check')
def db_permission_check():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'lyole.db')
    can_read = os.access(db_path, os.R_OK)
    can_write = os.access(db_path, os.W_OK)
    return jsonify({"can_read": can_read, "can_write": can_write})


@app.route('/whoami')
def whoami():
    if g.user:
        return jsonify({"id": g.user["id"], "username": g.user["username"], "role": g.user["role"]})
    return jsonify({"username": "Anonymous"})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)