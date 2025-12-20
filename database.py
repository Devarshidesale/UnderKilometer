import sqlalchemy as alchemy
from sqlalchemy import create_engine, text, Table, Column, MetaData, Integer, String, ForeignKey
import pymysql as pms

DATABASE_URL = "mysql+pymysql://2G57bbn4J9q1ruD.root:fAzz6Q2HvFbz0guU@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test"

engine = create_engine(
   DATABASE_URL,
   connect_args={
      "ssl":{"ssl_mode": "VERIFY_IDENTITY"}
   },
   echo=True,
)

with  engine.connect() as connection:
  result = connection.execute(text("SELECT * FROM UnderKilometer_survey_response"))
  # col_names =  result.keys()
  # print(col_names)
  result_all = result.all()
  print(f"type of result.all(): {type(result_all)}")
  print(f"type of result: {type(result)}")
  if result_all:
    first_res = result_all[0]
    print(f"type of first_res: {type(first_res)}")
  else:
    print("No results found in the table")
  