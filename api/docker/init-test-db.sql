-- Exécuté une seule fois, à la création du conteneur PostgreSQL :
-- crée la base séparée utilisée par les tests automatiques (npm test).
CREATE DATABASE kartnet_test OWNER kartnet;
