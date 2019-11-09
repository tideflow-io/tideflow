# <a href='https://tideflow.io'><img src='https://raw.githubusercontent.com/tideflow-io/tideflow/b7d354c8d08d5934dcd2d351951eba29d84ed8dd/readme.jpg' width='260' alt='Tideflow.io'></a>

> Design, automate and monitor workflows in realtime.

Designing automated workflow processes is as easy as drag and drop. Create and connect tasks to create a custom workflow that replaces manual steps with automation.

<img src="https://raw.githubusercontent.com/tideflow-io/tideflow-website/master/website/static/img/D43dLHRXsAIwXDs.jpg" height="400" style="border:1px solid gray;">

## Run tasks in your own computers

[Tideflow's agent](https://github.com/tideflow-io/tideflow-agent) allows you to run workflow tasks in your own infrastructure. Either if it's for running an arbitrary command from your personal computer, or building and deploying after pushing to GitHub from your office's server.

- [Learn more](https://docs.tideflow.io/docs/services-agent)

## Create complex task connections

Our workflow editor allows you to create multiple-to-multiple connections between tasks. Tideflow's execution engine will take care of the rest.

- [Learn more](https://docs.tideflow.io/docs/workflows-introduction)

## Automate and create anything

Tideflow comes with a set of services that will allow you to do things like automating website contents scraping, automate build and deploy processes, generate PDF files, send emails and more. You can also build your own integrations.

- [More about services](https://docs.tideflow.io/docs/services-introduction)
- [Developer’s guide](https://docs.tideflow.io/docs/developers)


[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/tideflow-io/tideflow)

---
## Quick start

Installing Tideflow is pretty simple. Once you have MeteorJS installed, you are
good to go.

MeteorJS will create and launch an isolated MongoDB and Tideflow.

### Installation

1. Requirements:

- Install MeteorJS [OSX / Linux / Windows](https://www.meteor.com/install)
- If you want to contribute to Tideflow's source code you will also need a
GitHub account with a [configured SSH key](https://help.github.com/articles/adding-a-new-ssh-key-to-your-github-account/)

3. Clone [**Tideflow**](https://github.com/tideflow-io/tideflow)

```sh
# Via SSH - method for contributors
git clone git@github.com:tideflow-io/tideflow.git

# Via HTTPS
git clone https://github.com/tideflow-io/tideflow.git
```

4. You are all setup, cd into the Tideflow's folder and execute meteor.

```sh
cd tideflow
meteor
```

The process will take some time the first time. It will download the meteor
release, all the project's dependencies, and start mongodb.

5. Open your browser and visit [localhost:3000](http://localhost:3000)

The first time you try to login, Tideflow will open the installation
screen. This is a single step process that will create your first user
credentials as well as some other necessary settings.

The next time you want to execute Tideflow locally, simply run `meteor`

---

## Contributing

If you would like to contribute to Tideflow, check out the
[Contributing Guide](https://docs.tideflow.io/docs/contribute).

## License

GNU AFFERO GENERAL PUBLIC LICENSE

## Developer Resources

- Documentation: https://docs.tideflow.io/docs/introduction
- Contribute: https://docs.tideflow.io/docs/contribute
