import yfinance as yf
import pandas as pd

def get_stock_data(ticker: str, start: str = None, end: str = None, period: str = "1mo"):
    stock = yf.Ticker(ticker)

    if start and end:
        hist = stock.history(start=start, end=end)
    else:
        hist = stock.history(period=period)

    return hist.reset_index()
