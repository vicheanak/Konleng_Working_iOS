# Konleng - Real Estate App Ionic 3

This project is built for the purpose of practicing my skills, and future works reference. 

It's built under Ionic 3 with Firebase as the back-end server.

<img src="https://i.imgur.com/rZyNh7k.jpg" width="200">
<img src="https://i.imgur.com/21K6vJM.jpg" width="200">
<img src="https://i.imgur.com/SOlyJQk.jpg" width="200">

## Description
Freshly design with easy navigation to search for properties in 25 cities and provinces in Cambodia. The feature of all real estates display on Google Map delivers a much greater experience for users who are looking for buy or rent properties in the preferably areas. The save search function would definitely help the user to read more detail information on later date. Users may as well follow the other members and receive notification alert once such members post a new property. Regarding to add and edit information, our team has made it to super easy like 1, 2, 3. Please go ahead and give it a try.

### Features
* Easy navigate to properties by cities/provinces of Kingdom of Cambodia
* Display real estates in Google Map
* Filter and sort properties by created date, price, buy sell or rent, apartment, condo, house, villa, or plot land
* Save property
* Follow members and receive alert notification once new listing is created
* Create new property is as easy as counting 1,2,3
* Support English and Khmer language

## Getting Started

To begin using this template, choose one of the following options to get started:
* Clone the repo: `git clone https://github.com/vicheanak/konleng`
* Fork the repo

## Project Structure

```
.
 ├── resources                    # Build files on the specific platforms (iOS, Android) and app icon + splash
 ├── src                          # This is where the app lives - *the main folder*
 ├── .editorconfig                # A helper file to define and maintain coding styles across environments
 ├── .gitignore                   # Specifies intentionally untracked files to ignore when using Git
 ├── .io-config.json              # Ionic ID
 ├── config.xml                   # Ionic config file
 ├── .ionic.config.json           # Global configuration for your Ionic app
 ├── package.json                 # Dependencies and build scripts
 ├── readme.md                    # Project description
 ├── tsconfig.json                # TypeScript configurations
 └── tslint.json                  # TypeScript linting options
```

### src directory
```
.
   ├── ...
   ├── src                       
   │   ├── app                    # This folder contains global modules and styling
   │   ├── assets                 # This folder contains images and the *data.json*
   |   ├── pages                  # Contains all the individual pages (home, tabs, category, list, single-item)
   |   ├── services               # Contains the item-api service that retrieves data from the JSON file
   |   ├── theme                  # The global SCSS variables to use throughout the app
   |   ├── declarations.d.ts      # A config file to make TypeScript objects available in intellisense
   |   ├── index.html             # The root index app file - This launches the app
   |   ├── manifest.json          # Metadata for the app
   │   └── service-worker.js      # Cache configurations
   └── ...
```


## Start the project
The project is started with the regular ionic commands.

1. Run `npm install` to install all dependencies.
2. Run `ionic serve` to start the development environment.
3. To build the project run `ionic build android` or `ionic build ios`. In order for you to build an iOS app, you need to run on MacOS.

An alternative is to emulate the app on a device or upload it to the ionic cloud. From here you can download the ionic view app and use the app on all devices.

## Bugs and Issues

Have a bug or an issue with this template? [Open a new issue](https://github.com/vicheanak/konleng/issues) here on Github.

## Creator

The template was created by and is maintained by **[Vannavy Vicheanak](https://medium.com/@vicheanak)**

## Copyright and License

Copyright 2018 Vannavy Vicheanak. Code released under the [MIT](https://github.com/vicheanak/konleng/blob/master/LICENSE) license.