#!/bin/sh

# Rodar ambos os scripts Python em segundo plano
python intent_pipeline.py &
python intent_tagging.py &

# Esperar pelos processos para evitar que o container saia
wait
