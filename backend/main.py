from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.fetch_data import get_stock_data
from services.prediction import predict_stock_prices
from datetime import date
from typing import List
from fastapi import Query
import pandas as pd
import yfinance as yf


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # in prod: restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/about/{ticker}")
def about_company(ticker: str):
    ticker_obj = yf.Ticker(ticker)
    profile = ticker_obj.info.get("longBusinessSummary") or ticker_obj.info.get("shortName") or "No info available."
    return {"ticker": ticker, "description": profile}

@app.get("/stock/{ticker}")
def stock_info(ticker: str, start: str = None, end: str = None, period: str = "1mo"):
    data = get_stock_data(ticker, start, end, period)
    return {"data": data.to_dict(orient="records")}

@app.get("/predict/{ticker}")
def stock_prediction(ticker: str, period: str = "1mo", days_ahead: int = 5):
    data = get_stock_data(ticker, period=period)
    predictions = predict_stock_prices(data, days_ahead)
    return {"ticker": ticker, "predictions": predictions}

@app.get("/quarterly/{ticker}")
def quarterly_stock_data(ticker: str, year: int, quarters: str = Query(...)):
    quarter_list = quarters.split(",")
    results = {}

    for quarter in quarter_list:
        quarter = quarter.strip().upper()
        
        if quarter == "Q1":
            start_date = date(year, 4, 1)
            end_date = date(year, 6, 30)
        elif quarter == "Q2":
            start_date = date(year, 7, 1)
            end_date = date(year, 9, 30)
        elif quarter == "Q3":
            start_date = date(year, 10, 1)
            end_date = date(year, 12, 31)
        elif quarter == "Q4":
            start_date = date(year + 1, 1, 1)
            end_date = date(year + 1, 3, 31)
        else:
            continue

        today = date.today()
        if start_date > today:
            results[quarter] = []
            continue

        if end_date > today:
            end_date = today

        df = get_stock_data(
            ticker,
            start=start_date.strftime("%Y-%m-%d"),
            end=end_date.strftime("%Y-%m-%d"),
            period="max"
        )

        results[quarter] = df.to_dict(orient="records")

    return {
        "ticker": ticker,
        "year": year,
        "quarters": results
    }
