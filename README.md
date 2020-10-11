# <a href='https://tideflow.io'><img src='https://raw.githubusercontent.com/tideflow-io/tideflow/b7d354c8d08d5934dcd2d351951eba29d84ed8dd/readme.jpg' width='260' alt='Tideflow.io'></a>

[![Total alerts](https://img.shields.io/lgtm/alerts/g/tideflow-io/tideflow.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/tideflow-io/tideflow/alerts/) [![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/tideflow-io/tideflow.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/tideflow-io/tideflow/context:javascript)

> Using Tideflow, you can design, automate and monitor your workflows in realtime.

It's as easy as drag and drop. Create and connect tasks to create custom
workflows that replaces manual steps with automation.

<img src="https://raw.githubusercontent.com/tideflow-io/tideflow-website/master/website/static/img/D43dLHRXsAIwXDs.jpg" height="400" style="border:1px solid gray;">

## Everything you need in workflow management

- **Connect services and actions:** Designing any complexity process is as easy as drag-and-drop tasks with our tool.
- **Audit and Improve:** Get realtime insights, logs and timings on your processes. Directly on the tool or via daily or weekly digest emails.

## Understand how your processes are behaving. With the blink of an eye.

Tideflow comes with live monitoring dashboards where you can understand how your
workflows are behaving. You also have live action-by-action logs, filterable
historical execution logs and graphical visuals of executions.

- [More about monitoring...](https://docs.tideflow.io/docs/monitor)

## Working with files in your processes

You and your workflows can create files and connect them to processes. From an
image you want to attach to your emails, to storing an screenshot taken from a
website scraped via WebParsy integration.

- [More about files feature](https://docs.tideflow.io/docs/files)

## Run actions in your own computers

Tideflow's agent allows you to run workflows actions in your own infrastructure.
Either if it's for running an arbitrary command from your personal computer, or
building and deploying after pushing to GitHub from your office's server.

- [More about the agent](https://github.com/tideflow-io/tideflow-agent)

## Automate complex processes

Our workflow editor allows you to create multiple-to-multiple connections
between actions. Tideflow's execution engine will take care of the rest.

- [More about workflows](https://docs.tideflow.io/docs/workflows-introduction)

## Automate and create anything

Tideflow comes with a set of services that will allow you to do things like
automating website contents scraping, automate build and deploy processes,
generate PDF files, send emails and more. You can also build your own
integrations.

- [More about services](https://docs.tideflow.io/docs/services-introduction)
- [Developer's guide](https://docs.tideflow.io/docs/developers)

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

2. You are all setup, cd into the Tideflow's folder and execute meteor.

```sh
cd tideflow
meteor
```

The process will take some time the first time. It will download the meteor
release, all the project's dependencies, and start mongodb.

3. Open your browser and visit [localhost:3000](http://localhost:3000)

The first time you try to login, Tideflow will open the installation
screen. This is a single step process that will create your first user
credentials as well as some other necessary settings.

The next time you want to execute Tideflow locally, simply run `meteor`

### Deploy

You can run Tideflow anywhere, like any other MeteorJS or NodeJS application.

Check the documentation for [manual deployment](https://docs.tideflow.io/docs/sysadmin-deploying)
instructions or [via Docker](https://docs.tideflow.io/docs/sysadmin-deploying-docker).

```bash
docker run -d \ 
  -p 80:3000 \
  -e ROOT_URL="<the url where your application will be available>" \
  -e MONGO_URL="<mongodb deployment>" \
  -e JWT_SECRET="<a random security token>" \
  tideflowio/tideflow:latest
```

---

## Contributing

If you would like to contribute to Tideflow, check out the
[Contributing Guide](https://docs.tideflow.io/docs/contribute).

## License

GNU GENERAL PUBLIC LICENSE V3

## Developer Resources

- Documentation: https://docs.tideflow.io/docs/introduction
- Contribute: https://docs.tideflow.io/docs/contribute
