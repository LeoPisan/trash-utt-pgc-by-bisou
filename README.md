# Système de Planification Générale des Cours (PGC) - CLI

Ce projet est un utilitaire en ligne de commande (CLI) permettant de gérer les salles, emplois du temps et visualisations de l’Université Centrale de la République de Sealand (SRU). Ce logiciel est réalisé dans le cadre de GL02, à partir du sujet A.

---

## Fonctionnalités

1. **Lecture et analyse des emplois du temps :**
    - Charge et analyse les fichiers `.cru` contenant les emplois du temps.
2. **Consultation des salles disponibles :**
    - Affiche les salles disponibles pour une plage horaire donnée ou les salles associées à un cours.
3. **Génération de fichiers iCalendar :**
    - Crée des fichiers `.ics` pour intégrer les cours dans un agenda.
4. **Classement des salles par capacité d’accueil :**
    - Génère un fichier `.csv` listant les salles triées par capacité d’accueil décroissante.
5. **Vérification des disponibilités d’une salle :**
    - Possibilité de consulter les créneaux disponibles d’une salle pour organiser des réunions ou travaux de groupe.

---

## Prérequis

- **Node.js** : version 14+ recommandée
- **npm** : installé avec Node.js
- **Dépendances** :
    - [ics](https://www.npmjs.com/package/ics)
    - [csv-writer](https://www.npmjs.com/package/csv-writer)

---

## Installation

- Cloner le dépôt Github :
```bash
git clone https://github.com/plassasseigne/trash-utt-pgc/ {PATH}
```

- Installer les dépendances depuis le répertoire :
```bash
npm install
```

- Exécuter le CLI puis se laisser guider :
```bash
node index.js
```

---

## Commandes

TODO

---

## Auteurs

<h3>L'équipe Trash'UTT</h3>

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/plassasseigne.png" width="100" height="100"><br>
      <strong>Paul Lassasseigne</strong><br>
      <a href="https://github.com/votreprofil">Votre Profil GitHub</a>
    </td>
    <td align="center">
      <img src="https://github.com/no-penpen.png" width="100" height="100"><br>
      <strong>Thomas Matamba</strong><br>
      <a href="https://github.com/no-penpen">Profil GitHub</a>
    </td>
    <td align="center">
      <img src="https://github.com/vltbcq.png" width="100" height="100"><br>
      <strong>Valentin Bocquier</strong><br>
      <a href="https://github.com/vltbcq">Profil GitHub</a>
    </td>
  </tr>
</table>
