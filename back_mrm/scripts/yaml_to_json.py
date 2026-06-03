import json

import yaml


def run():
    # Parse the YAML data
    with open("./back_mrm/data/operateurs.yml", encoding="utf-8") as yaml_file:
        # Load the YAML data from the file
        parsed_data = yaml.safe_load(yaml_file)

    # Initialize an empty list to store the JSON objects
    json_objects = []

    # Iterate through the parsed data and convert it to the desired JSON format
    for entry in parsed_data:
        json_object = {
            "model": "back_mrm.operateur",
            "pk": entry["informations"]["identifiant"],
            "fields": {
                "nomEntier": entry["informations"]["nom_entier"],
                "nomAffichage": entry["informations"]["nom_affichage"],
                "logo": entry["informations"]["logo"],
                "couleurDefaut": entry["couleurs"]["defaut"],
                "couleurNiveau1": entry["couleurs"]["niveau_1"],
                "couleurNiveau2": entry["couleurs"]["niveau_2"],
                "couleurNiveau3": entry["couleurs"]["niveau_3"],
                "couleurNiveau4": entry["couleurs"]["niveau_4"],
                "perimetreMetro": entry["perimetres"]["metro"],
                "perimetre971": entry["perimetres"][971],
                "perimetre972": entry["perimetres"][972],
                "perimetre973": entry["perimetres"][973],
                "perimetre974": entry["perimetres"][974],
                "perimetre976": entry["perimetres"][976],
                "perimetre977": entry["perimetres"][977],
                "perimetre978": entry["perimetres"][978],
            },
        }
        json_objects.append(json_object)

    # Convert the list of JSON objects to JSON format
    json_output = json.dumps(json_objects, indent=4)
    with open("./back_mrm/data/operateurs.json", "w") as json_file:
        json_file.write(json_output)
