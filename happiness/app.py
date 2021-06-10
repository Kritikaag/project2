import numpy as np

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify
from sqlalchemy import create_engine
from flask import Response,json
# from flask_cors import CORS, cross_origin
from flask import Flask, render_template

#################################################
# Database Setup
#################################################
engine = create_engine("postgresql://iroikklkxnnpav:dccf35f488281d067a4a627232bff815d83fc0deb44ee26d5c0f59057331bbb2@ec2-54-167-152-185.compute-1.amazonaws.com:5432/dargfgk9hj0sjv")
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)


# Save reference to the table
# this script is like the API layer
# you could use app.js to call directly from Mongo, this .py file provides a middle layer
# if one day you decide to change db, then you can just modify this instead of front end js
# separate front end (js, html...) to back end: security credentials...

# to run this, push the csv to postgres

results = engine.execute("SELECT * FROM master").fetchall()

new = []
for i in results:
    a = {"country":i[0],"id":i[1],"continent":i[2],"year":i[3],"happiness_rating":i[4],"gdp_per_capita":i[5],"social_support":i[6],"life_expectancy":i[7],"freedom":i[8],"generosity":i[9],"corruption":i[10]}
    new.append(a)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

# cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
#################################################
# Flask Routes
#################################################


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/map")
def index():
    return render_template("map.html")

@app.route("/histogram")
def index():
    return render_template("histogram.html")

@app.route("/scatter")
def index():
    return render_template("scatter.html")

@app.route("/line")
def index():
    return render_template("line.html")

@app.route("/datatable")
def index():
    return render_template("datatable.html")

@app.route("/data", methods=["GET"])
def welcome():
    """List all available api routes."""
    
    #response = Response(json.dumps(new[0]), mimetype='application/json')
    #response = jsonify(results)
     #response.headers.add("Access-Control-Allow-Origin", "*")
    return (jsonify(new))


if __name__ == '__main__':
    # app.config['CORS_ALLOW_HEADERS'] = "Content-Type"
    # app.config['CORS_RESOURCES'] = {r"/api/*": {"origins": "*"}}
    app.run(debug=True)
