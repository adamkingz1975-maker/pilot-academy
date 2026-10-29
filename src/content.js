// Stable IDs connect translations and future learning modules.
export const subjects = [
  {
    "id": "subject-1",
    "title": {
      "de": "Grundlagen des Fliegens",
      "pl": "Zasady lotu"
    }
  },
  {
    "id": "subject-2",
    "title": {
      "de": "Allgemeine Luftfahrzeugkunde",
      "pl": "Ogólna wiedza o statku powietrznym"
    }
  },
  {
    "id": "subject-3",
    "title": {
      "de": "Meteorologie",
      "pl": "Meteorologia"
    }
  },
  {
    "id": "subject-4",
    "title": {
      "de": "Navigation",
      "pl": "Nawigacja"
    }
  },
  {
    "id": "subject-5",
    "title": {
      "de": "Luftrecht",
      "pl": "Prawo lotnicze"
    }
  },
  {
    "id": "subject-6",
    "title": {
      "de": "Flugleistung und Flugplanung",
      "pl": "Osiągi i planowanie lotu"
    }
  },
  {
    "id": "subject-7",
    "title": {
      "de": "Menschliches Leistungsvermögen",
      "pl": "Człowiek – możliwości i ograniczenia"
    }
  },
  {
    "id": "subject-8",
    "title": {
      "de": "Betriebliche Verfahren",
      "pl": "Procedury operacyjne"
    }
  },
  {
    "id": "subject-9",
    "title": {
      "de": "Kommunikation",
      "pl": "Łączność"
    }
  }
];
export const lessons = [
  {
    "id": "lesson-1",
    "subjectId": "subject-1",
    "title": {
      "de": "Warum fliegt ein Flugzeug?",
      "pl": "Dlaczego samolot lata?"
    },
    "icon": "🛩️",
    "paragraphs": {
      "de": [
        "Beim Fliegen wirken vier Kräfte: Auftrieb, Gewichtskraft, Schub und Luftwiderstand.",
        "Die Tragfläche erzeugt durch ihre Umströmung eine Druckverteilung und lenkt Luft nach unten ab. Die resultierende Kraft nach oben nennen wir Auftrieb.",
        "Damit ein Flugzeug im geraden, gleichförmigen Horizontalflug bleibt, gleichen sich Auftrieb und Gewichtskraft sowie Schub und Widerstand aus.",
        "Der Anstellwinkel ist der Winkel zwischen Profilsehne und anströmender Luft. Ein zu großer Anstellwinkel kann zum Strömungsabriss führen."
      ],
      "pl": [
        "Na samolot w locie działają cztery siły: siła nośna, ciężar, ciąg i opór aerodynamiczny.",
        "Skrzydło wytwarza rozkład ciśnienia i odchyla strumień powietrza w dół. Powstającą siłę skierowaną do góry nazywamy siłą nośną.",
        "W ustalonym locie poziomym siła nośna równoważy ciężar, a ciąg równoważy opór.",
        "Kąt natarcia to kąt między cięciwą profilu a kierunkiem napływającego powietrza. Zbyt duży kąt może wywołać przeciągnięcie."
      ]
    },
    "terms": [
      [
        "Auftrieb",
        "siła nośna"
      ],
      [
        "Schub",
        "ciąg"
      ],
      [
        "Widerstand",
        "opór"
      ],
      [
        "Anstellwinkel",
        "kąt natarcia"
      ]
    ]
  },
  {
    "id": "lesson-2",
    "subjectId": "subject-3",
    "title": {
      "de": "Was ist Wind?",
      "pl": "Czym jest wiatr?"
    },
    "icon": "🌤️",
    "paragraphs": {
      "de": [
        "Wind bezeichnet die Bewegung der Luft relativ zum Boden.",
        "Gegenwind reduziert bei gleicher Fluggeschwindigkeit gegenüber der Luft die Geschwindigkeit über Grund; Rückenwind erhöht sie.",
        "Für die Flugplanung sind Windrichtung, Windstärke und Böen wichtig."
      ],
      "pl": [
        "Wiatr to ruch powietrza względem powierzchni ziemi.",
        "Wiatr przeciwny zmniejsza prędkość względem ziemi przy tej samej prędkości względem powietrza; wiatr tylny ją zwiększa.",
        "Podczas planowania lotu ważne są kierunek i prędkość wiatru oraz porywy."
      ]
    },
    "terms": [
      [
        "Gegenwind",
        "wiatr przeciwny"
      ],
      [
        "Rückenwind",
        "wiatr tylny"
      ],
      [
        "Böe",
        "poryw wiatru"
      ]
    ]
  },
  {
    "id": "lesson-3",
    "subjectId": "subject-4",
    "title": {
      "de": "Geschwindigkeit über Grund",
      "pl": "Prędkość względem ziemi"
    },
    "icon": "🧭",
    "paragraphs": {
      "de": [
        "Die Eigengeschwindigkeit (TAS) beschreibt die Bewegung des Flugzeugs gegenüber der Luft.",
        "Die Geschwindigkeit über Grund (GS) ist die Bewegung gegenüber der Erdoberfläche. Wind verändert die Geschwindigkeit über Grund.",
        "Beispiel: 180 km/h TAS und 20 km/h direkter Gegenwind ergeben 160 km/h GS."
      ],
      "pl": [
        "Prędkość rzeczywista (TAS) opisuje ruch samolotu względem powietrza.",
        "Prędkość względem ziemi (GS) opisuje ruch względem powierzchni ziemi. Wiatr zmienia GS.",
        "Przykład: 180 km/h TAS i 20 km/h wiatru czołowego dają 160 km/h GS."
      ]
    },
    "terms": [
      [
        "Eigengeschwindigkeit",
        "prędkość rzeczywista"
      ],
      [
        "Geschwindigkeit über Grund",
        "prędkość względem ziemi"
      ]
    ]
  },
  {
    "id": "lesson-4",
    "subjectId": "subject-2",
    "title": {
      "de": "Die vier Hauptteile",
      "pl": "Główne części samolotu"
    },
    "icon": "⚙️",
    "paragraphs": {
      "de": [
        "Ein typisches Flugzeug besitzt einen Rumpf, Tragflächen, ein Leitwerk und ein Antriebssystem.",
        "Querruder steuern die Rollbewegung, Höhenruder die Nickbewegung und Seitenruder die Gierbewegung."
      ],
      "pl": [
        "Typowy samolot ma kadłub, skrzydła, usterzenie i układ napędowy.",
        "Lotki sterują przechyleniem, ster wysokości pochyleniem, a ster kierunku odchyleniem."
      ]
    },
    "terms": [
      [
        "Rumpf",
        "kadłub"
      ],
      [
        "Leitwerk",
        "usterzenie"
      ],
      [
        "Querruder",
        "lotki"
      ]
    ]
  }
];
export const questions = [
  {
    "id": "question-1",
    "subjectId": "subject-1",
    "text": {
      "de": "Welche Kraft wirkt der Gewichtskraft im stationären Horizontalflug entgegen?",
      "pl": "Która siła równoważy ciężar podczas ustalonego lotu poziomego?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "Auftrieb",
          "pl": "Siła nośna"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "Luftwiderstand",
          "pl": "Opór aerodynamiczny"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Schub",
          "pl": "Ciąg"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "Der Auftrieb gleicht im geraden, gleichförmigen Horizontalflug die Gewichtskraft aus.",
      "pl": "W ustalonym locie poziomym siła nośna równoważy ciężar."
    }
  },
  {
    "id": "question-2",
    "subjectId": "subject-1",
    "text": {
      "de": "Was kann passieren, wenn der kritische Anstellwinkel überschritten wird?",
      "pl": "Co może się stać po przekroczeniu krytycznego kąta natarcia?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "Strömungsabriss",
          "pl": "Przeciągnięcie"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "Automatische Beschleunigung",
          "pl": "Automatyczne przyspieszenie"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Mehr Kraftstoff im Tank",
          "pl": "Więcej paliwa w zbiorniku"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "Ein zu großer Anstellwinkel kann die Strömung am Flügel teilweise ablösen.",
      "pl": "Zbyt duży kąt natarcia może spowodować oderwanie strug od skrzydła."
    }
  },
  {
    "id": "question-3",
    "subjectId": "subject-4",
    "text": {
      "de": "Was bewirkt direkter Gegenwind bei gleicher TAS?",
      "pl": "Jak działa wiatr czołowy przy tej samej TAS?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "Geringere Geschwindigkeit über Grund",
          "pl": "Mniejsza prędkość względem ziemi"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "Höhere Geschwindigkeit über Grund",
          "pl": "Większa prędkość względem ziemi"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Keine Veränderung der Geschwindigkeit über Grund",
          "pl": "Brak zmiany prędkości względem ziemi"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "Gegenwind verringert die Groundspeed.",
      "pl": "Wiatr czołowy zmniejsza prędkość względem ziemi."
    }
  },
  {
    "id": "question-4",
    "subjectId": "subject-4",
    "text": {
      "de": "Welche Größe beschreibt die Bewegung gegenüber der Luft?",
      "pl": "Która wielkość opisuje ruch względem powietrza?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "TAS",
          "pl": "TAS"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "GS",
          "pl": "GS"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Flughöhe",
          "pl": "Wysokość lotu"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "TAS ist die wahre Fluggeschwindigkeit gegenüber der Luft.",
      "pl": "TAS to prędkość rzeczywista względem powietrza."
    }
  },
  {
    "id": "question-5",
    "subjectId": "subject-2",
    "text": {
      "de": "Welches Ruder steuert primär die Rollbewegung?",
      "pl": "Który ster steruje głównie przechyleniem?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "Querruder",
          "pl": "Lotki"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "Seitenruder",
          "pl": "Ster kierunku"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Höhenruder",
          "pl": "Ster wysokości"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "Die Querruder verändern die Auftriebsverteilung und erzeugen ein Rollmoment.",
      "pl": "Lotki zmieniają rozkład siły nośnej i wywołują moment przechylający."
    }
  },
  {
    "id": "question-6",
    "subjectId": "subject-3",
    "text": {
      "de": "Was bedeutet eine Böe?",
      "pl": "Co oznacza poryw wiatru?"
    },
    "options": [
      {
        "id": "answer-1",
        "text": {
          "de": "Eine kurzfristige Änderung der Windgeschwindigkeit",
          "pl": "Krótkotrwała zmiana prędkości wiatru"
        }
      },
      {
        "id": "answer-2",
        "text": {
          "de": "Eine unveränderte Windstille",
          "pl": "Niezmienna cisza wiatrowa"
        }
      },
      {
        "id": "answer-3",
        "text": {
          "de": "Ein festes Luftdruckniveau",
          "pl": "Stały poziom ciśnienia atmosferycznego"
        }
      }
    ],
    "correctId": "answer-1",
    "explanation": {
      "de": "Böen sind kurzfristige Schwankungen der Windgeschwindigkeit.",
      "pl": "Porywy to krótkotrwałe zmiany prędkości wiatru."
    }
  }
];

// Shared fundamentals. National rules and exam configurations live separately.
for (const item of [...lessons, ...questions]) item.scope = 'EASA';

const descriptions = [
  {
    "de": "Aerodynamik, Auftrieb, Widerstand",
    "pl": "Aerodynamika, siła nośna, opór"
  },
  {
    "de": "Motor, Struktur, Instrumente",
    "pl": "Silnik, konstrukcja, przyrządy"
  },
  {
    "de": "Wetter, Wind, Wolken",
    "pl": "Pogoda, wiatr, chmury"
  },
  {
    "de": "Karten, Kurse, GPS",
    "pl": "Mapy, kursy, GPS"
  },
  {
    "de": "Flugregeln und Lufträume",
    "pl": "Przepisy lotnicze i przestrzeń powietrzna"
  },
  {
    "de": "Masse, Schwerpunkt, Startstrecke",
    "pl": "Masa, środek ciężkości, długość startu"
  },
  {
    "de": "Sauerstoff, Müdigkeit, Entscheidungen",
    "pl": "Tlen, zmęczenie, podejmowanie decyzji"
  },
  {
    "de": "Checklisten, Notfälle",
    "pl": "Listy kontrolne, sytuacje awaryjne"
  },
  {
    "de": "Flugfunk und Phraseologie",
    "pl": "Łączność radiowa i frazeologia"
  }
];
subjects.forEach((subject, index) => { subject.description = descriptions[index]; });
