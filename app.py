from flask import Flask, render_template, jsonify, request, redirect, flash
from flask_sqlalchemy import SQLAlchemy
import random
import json
import os
from PIL import Image
from mimetypes import guess_type
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lyole.db'
db = SQLAlchemy(app)


class Letter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=True)
    text = db.Column(db.Text, nullable=False)
    author = db.Column(db.String(50), nullable=False)


class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(300), nullable=True)
    img_data = db.Column(db.BLOB, nullable=False)
    author = db.Column(db.String(50), nullable=False)
    desc = db.Column(db.Text, nullable=True)


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
    stored_letters = Letter.query.all()
    return render_template('stored_letters.html', stored_letters=stored_letters)


@app.route("/letters", methods=['POST', 'GET'])
def letters():
    if request.method == 'POST':
        title = request.form.get('title')
        text = request.form.get('text')
        
        if text:
            try:
                new_letter = Letter(title=title, text=text, author='Anonymous')
                #позже получим автора из сессии
                db.session.add(new_letter)
                db.session.commit()
                flash('Успешно отправлено')
                    
            except Exception as e:
                db.session.rollback()
                db.session.close()
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
        
        if file and file.filename:
            img_data = file.read()
            try:
                image = Image.open(BytesIO(img_data))
                image.verify()
                name = file.filename
                new_photo = Photo(name=name, img_data=img_data, author='Anonymous', desc=desc)
                #позже получим автора из сессии
                db.session.add(new_photo)
                db.session.commit()
                flash('Успешно отправлено')

            except (IOError, SyntaxError) as img_err:
                flash('Загруженный файл не является изображением')
                print(f"Ошибка валидации изображения: {img_err}")
                    
            except Exception as e:
                db.session.rollback()
                db.session.close()
                flash('Ошибка при сохранении в базу данных')
                print(f"Ошибка базы данных: {e}")
        else:
            flash('Выбери файл')
        
        return redirect('/photos')
    else:
        return render_template('photos.html')
    

@app.route("/photos/stored")
def stored_photos():
    stored_photos = Photo.query.all()
    return render_template('stored_photos.html', stored_photos=stored_photos)

@app.route('/photos/<int:photo_id>')
def photo_data(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    mime_type = guess_type(photo.name)[0] or 'application/octet-stream'
    return app.response_class(photo.img_data, mimetype=mime_type)

@app.route('/photo/view/<int:photo_id>')
def photo_view(photo_id):
    photo = Photo.query.get_or_404(photo_id)
    return render_template('photo_view.html', photo=photo)

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


# filepath: c:\WEB\lyole\app.py
@app.route('/db_permission_check')
def db_permission_check():
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'lyole.db')
    can_read = os.access(db_path, os.R_OK)
    can_write = os.access(db_path, os.W_OK)
    return jsonify({"can_read": can_read, "can_write": can_write})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)