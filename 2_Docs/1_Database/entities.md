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
  ENFADAD@,
  CANSAD@,
  MOLEST@
}

enum RatingVal {
    MAL,
    BIEN,
    MUYBIEN
}

class Index {
  Number children
}

class Event {
  String title
  String description
}

class Tomorrow {
  Boolean nappy
  Boolean wipe
  Boolean clothes
  Boolean water
}

class Poo {
  Integer times
  PooType type
}

class Food {
    RatingVal breakfast
    RatingVal meal
    RatingVal snack
}

class Agenda {
  Date day
  Event event
  Dictionary<Number, AgendaItem> agendas;
}

class AgendaItem {
  Date date
  Event event
  Tomorrow tomorrow
  Mood mood
  Poo poo
  Food food
  String comment
}

class OneSignalKeys {
  String push
  String id
  String platform
}

class AesKeys {
  String secureKey
  String secureIV
}

class UserInfo {
  Number index
  String uuid
  String name
  String mail
  String picture
  OneSignalKeys push
  AesKeys aes
}

class Follower extends UserInfo {
  Number idOnTeacherApp
  String tel
  String relationship
}

class Teacher extends UserInfo {

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
  AgendaItem[] agendaItems
}

Event o-- AgendaItem
Tomorrow o-- AgendaItem
Poo o-- AgendaItem
Food o-- AgendaItem
@enduml