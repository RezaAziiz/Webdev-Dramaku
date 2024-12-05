import pandas as pd
import psycopg2
import re
import random
from datetime import datetime, timedelta

# Establishing the connection
conn = psycopg2.connect(
    dbname='postgres',
    user='postgres',
    password='Aziiz_4321',
    host='localhost',
    port='5432'
)
cursor = conn.cursor()

# Read the Excel file
data = pd.read_excel('C:\\Users\\Reza Maulana Aziiz\\Downloads\\Versi2Dataset.xlsx')


####### Input data into countries table #########
# # Strip unwanted whitespace and handle potential newline characters
# data['Country'] = data['Country'].astype(str).str.strip().replace({'\n': ''}, regex=True)

# # Filter out rows that still have empty or invalid data
# data = data[data['Country'].str.strip() != '']

# # Get unique country names
# unique_countries = data['Country'].unique()

# # Insert data into the 'countries' table
# country_id = 1
# for country in unique_countries:
#     cursor.execute(
#         "INSERT INTO countries (id, name) VALUES (%s, %s)",
#         (country_id, country)
#     )
#     country_id += 1
#     print(country)

# conn.commit()
# cursor.close()
# conn.close()

######## Input data into genres table #########
# unique_genres = set()

# # Split genres, strip whitespace, and add to the set of unique genres
# for index, row in data.iterrows():
#     genres = row['Genres (Up to 5)'].split(',')
#     genres = [genre.strip() for genre in genres]  # Clean up whitespace
#     unique_genres.update(genres)  # Add to set (ensures uniqueness)

# # Convert set to a sorted list
# sorted_genres = sorted(unique_genres)

# genre_id = 1
# for genre in sorted_genres:
#     # Check if the genre is not empty or just whitespace
#     if genre:  # This condition checks for non-empty strings
#         # Uncomment to execute the actual insert query
#         cursor.execute(
#             "INSERT INTO genres (id, name) VALUES (%s, %s)",
#             (genre_id, genre)
#         )
#         genre_id += 1
#         print(genre)

# conn.commit()
# cursor.close()
# conn.close()


# ######### Input data into actors table #########
# Fungsi untuk menghasilkan tanggal acak antara dua tahun
def random_date(start_year, end_year):
    start_date = datetime(start_year, 1, 1)
    end_date = datetime(end_year, 12, 31)
    delta = end_date - start_date
    random_days = random.randint(0, delta.days)
    return start_date + timedelta(days=random_days)

# # Ambil daftar country_id dari tabel countries
# # Ambil daftar negara dan id dari tabel countries
cursor.execute("SELECT id, name FROM countries")
countries = cursor.fetchall()  # Mendapatkan list (id, name) dari tabel countries
country_map = {name: id for id, name in countries}  # Membuat mapping dari name ke id

valid_country_names = list(country_map.keys())  # Mendapatkan semua nama negara yang valid

unique_actors = set()

# Split data aktor, hilangkan spasi, dan tambahkan ke set aktor unik
for index, row in data.iterrows():
    actors = row['Actor (Up to 9)'].split(',')
    actors = [actor.strip() for actor in actors if actor.strip()]  # Hilangkan spasi dan skip yang kosong
    unique_actors.update(actors)  # Tambahkan ke set untuk memastikan keunikan

# Ubah set menjadi list yang terurut
sorted_actors = sorted(unique_actors)

actor_id = 1
for actor in sorted_actors:
    if actor:  # Pastikan aktor tidak kosong
        birthdate = random_date(1985, 2000).strftime('%Y-%m-%d')  # Tanggal acak
        url_photos = None  # Set url_photos ke NULL
        country_name = random.choice(valid_country_names)  # Pilih nama negara secara acak
        country_id = country_map[country_name]  # Dapatkan id dari country_map berdasarkan nama negara
        
        # Insert query ke tabel actors
        cursor.execute(
            "INSERT INTO actors (id, name, birthdate, url_photos, country_id) VALUES (%s, %s, %s, %s, %s)",
            (actor_id, actor, birthdate, url_photos, country_id)
        )
        
        print(f"ID: {actor_id}, Name: {actor}, Birthdate: {birthdate}, URL_Photos: {url_photos}, Country_ID: {country_id} ({country_name})")
        actor_id += 1

conn.commit()
cursor.close()
conn.close()



######### Input data into awards table #########
# awards_data = set()  # Use a set to ensure uniqueness

# # Regular expression to match 4-digit years (e.g., 1997, 1998)
# year_regex = re.compile(r'(\d{4})')

# # Loop through the 'Award' column
# for index, row in data.iterrows():
#     award_entry = row['Award']
    
#     if pd.notna(award_entry):  # Check if the award data is not NULL
#         # Split the award entry by commas to handle multiple awards in one cell
#         awards = award_entry.split(',')
        
#         for award in awards:
#             award = award.strip()  # Clean up leading/trailing spaces
            
#             # Search for the year in the award string
#             match = year_regex.search(award)
            
#             if match:
#                 # Extract the year
#                 year = match.group(0)
#                 # Remove the year from the award name
#                 award_name = award.replace(year, '').strip(' ·')
#             else:
#                 # If no year is found, set year as None
#                 year = None
#                 award_name = award
            
#             # Clean up the award name (remove extra spaces and characters)
#             award_name = award_name.strip()

#             # Add the unique award name and year to the set
#             awards_data.add((award_name, year))  # Add as a tuple to ensure uniqueness

# award_id = 1
# for award_name, year in sorted(awards_data, key=lambda x: (x[0] is not None, x[0])):
#     # Uncomment to execute the actual insert query
#     # cursor.execute(
#     #     "INSERT INTO award (id, name, year) VALUES (%s, %s)",
#     #     (award_id, award_name, year)
#     # )
# award_id += 1
#     print(f"Award Name: {award_name} \n Year: {year} \n\n")
    
# conn.commit()
# cursor.close()
# conn.close()


######### Input data into movies, awards, and many to many table #########
# Clean up the country names
# data['Country'] = data['Country'].astype(str).str.strip().replace({'\n': ''}, regex=True)

# # Filter out rows that still have empty or invalid country data
# data = data[data['Country'].str.strip() != '']

# # Clean up the genre data and collect unique genres
# unique_genres = set()
# for index, row in data.iterrows():
#     genres = row['Genres (Up to 5)'].split(',')
#     genres = [genre.strip() for genre in genres]  # Clean up whitespace
#     unique_genres.update(genres)

# # Clean up the actor data and collect unique actors
# unique_actors = set()
# for index, row in data.iterrows():
#     actors = row['Actor (Up to 9)'].split(',')
#     actors = [actor.strip() for actor in actors if actor.strip()]  # Remove spaces and skip empty
#     unique_actors.update(actors)

# year_regex = re.compile(r'(\d{4})')

# # Now, you can start inserting movies and perform lookups
# for index, row in data.iterrows():
#     # 1. Lookup country_id from the countries table
#     cursor.execute("SELECT id FROM countries WHERE name = %s", (row['Country'],))
#     country_result = cursor.fetchone()
    
#     if country_result is None:
#         print(f"Country '{row['Country']}' not found.")
#         continue  # Skip this row if country not found
    
#     country_id = country_result[0]

#     # 2. Insert into movies table
#     cursor.execute("""
#         INSERT INTO movies (title, alt_title, synopsis, year, availability, trailer, images, rates, created_at)
#         VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
#         RETURNING id
#     """, (
#         row['Title'], 
#         row['Alternative Title'], 
#         row['Synopsis'], 
#         row['Year'], 
#         row['Availability'], 
#         row['Trailer(link YT)'], 
#         row['URL Photo'], 
#         None  # Assuming rates will be NULL initially
#     ))
    
#     movie_id = cursor.fetchone()[0]

#     # 3. Lookup and insert genres into movie_genre
#     genres = row['Genres (Up to 5)'].split(',')
#     for genre in genres:
#         genre = genre.strip()
#         cursor.execute("SELECT id FROM genres WHERE name = %s", (genre,))
#         result = cursor.fetchone()

#         if result is None:
#             print(f"Genre '{genre}' not found in the database.")
#             continue
        
#         genre_id = result[0]
#         cursor.execute("INSERT INTO movie_genre (movie_id, genre_id) VALUES (%s, %s)", (movie_id, genre_id))

#     # 4. Lookup and insert actors into movie_actor
#     actors = row['Actor (Up to 9)'].split(',')
#     for actor in actors:
#         actor = actor.strip()
        
#         cursor.execute("SELECT id FROM actors WHERE name = %s", (actor,))
#         result = cursor.fetchone()
        
#         if result is None:
#             # Handle new actor insertion if needed
#             print(f"Actor '{actor}' not found in the database. Consider inserting it.")
#             continue
        
#         actor_id = result[0]
#         cursor.execute("INSERT INTO movie_actor (movie_id, actor_id) VALUES (%s, %s)", (movie_id, actor_id))

#     conn.commit()

#    # 5. Insert awards into awards table and link them to movie_award
#     if pd.notna(row['Award']):  # Check if the award data is not NULL
#         awards = row['Award'].split(', ')
#         for award in awards:
#             award = award.strip()
#             match = year_regex.search(award)
            
#             # Default to None for year if no match is found
#             if match:
#                 year = match.group(0)
#                 award_name = award.replace(year, '').strip(' ·')
#             else:
#                 year = None
#                 award_name = award.strip()
            
#             # Ensure award_name is not empty before inserting
#             if award_name:
#                 # Lookup award_id or insert if doesn't exist
#                 cursor.execute("SELECT id FROM awards WHERE name = %s AND year = %s", (award_name, year))
#                 result = cursor.fetchone()
#                 if result is None:
#                     # Insert award only if award_name is present
#                     cursor.execute("INSERT INTO awards (name, year) VALUES (%s, %s) RETURNING id", (award_name, year))
#                     award_id = cursor.fetchone()[0]
#                 else:
#                     award_id = result[0]
                
#                 # Insert into movie_award table
#                 cursor.execute("INSERT INTO movie_award (movie_id, award_id) VALUES (%s, %s)", (movie_id, award_id))

# conn.commit()
# cursor.close()
# conn.close()



