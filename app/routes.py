import numpy as np
import math
import scipy.stats as st
from app import app
from flask import render_template, redirect, url_for, jsonify


@app.route("/home")
@app.route("/")
def ha():
    return redirect(url_for("proportion"))


@app.route("/proportion")
def proportion():
    return render_template("proportion.html")


@app.route("/proportion/generate_population/<float:p>")
def generate_proportion_population(p):
    data = np.random.binomial(1, p, 100_000)
    return jsonify(data.tolist())


@app.route("/proportion/generate_confidence_interval/<float:p_hat>/<int:sample_size>/<float:confidence_level>")
def generate_proportion_confidence_interval(p_hat, sample_size, confidence_level):
    se = math.sqrt((p_hat*(1 - p_hat))/sample_size)
    left, right = st.t.interval(alpha=confidence_level, df=sample_size - 1, loc=p_hat, scale=se)
    return jsonify({"left": left, "right": right})
