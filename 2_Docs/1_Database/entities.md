@startuml

enum PooType {
  NORMAL,
  BLANDA,
  DIARREA,
  DURA
}

enum Mood {
  FELIZ,
  TRSITE,
  ENFADADO,
  CANSADO,
  MOLESTO
}

enum FoodState {
    GOOD,
    REGULAR,
    BAD
}

class Ceremony {
  String title
  String description
}

class ToBring {
  Boolean nappy
  Boolean wipe
}

class Poo {
  Integer times
  PooType type
}

class Food {
    FoodState breakfast
    FoodState meal
    FoodState snack
}


class Report {
  Date date
  Ceremony ceremony
  ToBring toBring
  Mood mood
  Poo poo
  Food food
  String comment
}

class Teacher {
  String name
  String tel
  String mail
  String push
}

class Centre {
  String name
  String tel
  String mail
}

class Child {
  String name
  String image
  Date birthdate
  Report[] reports
}

Report o-- Child
Ceremony o-- Report
ToBring o-- Report
Mood  o-- Report
Poo o-- Report
Food o-- Report
PooType o-- Poo
FoodState o-- Food
@enduml