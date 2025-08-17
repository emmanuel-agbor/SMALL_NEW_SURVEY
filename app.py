from flask import Flask, render_template
import os
import sys
import sqlite3

app = Flask(__name__)

@app.route('/')
def home():
    return render_template("index.html", title="Home")

@app.route('/surveys')
def survey_selection():
    return render_template("survey.html", title="Create Survey")

@app.route('/about')
def about():
    return render_template("", title="")



if __name__ == '__main__':
    app.run(debug=True)