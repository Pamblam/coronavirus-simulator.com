#!/usr/bin/env bash

rm -rf data/*
git clone https://github.com/CSSEGISandData/COVID-19.git
mv COVID-19/csse_covid_19_data/csse_covid_19_daily_reports_us/*.csv data/
rm -rf COVID-19
