import logging

from app.db.database import SessionLocal
from app.utils.init_db import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init() -> None:
    db = SessionLocal()
    init_db(db)


def main() -> None:
    logger.info("Création des données initiales")
    init()
    logger.info("Données initiales créées")


if __name__ == "__main__":
    main()