from fabric.contrib.files import exists
from fabric.api import run, local, env


REPO_URL = 'git@github.com:alamastor/interpreter.git'

def deploy():
    site_dir = f'~/sites/{env.host}'
    _update_source(site_dir)
    _npm_update(site_dir)
    _build(site_dir)


def _update_source(site_dir):
    if exists(f'{site_dir}/.git'):
        run(f'cd {site_dir} && git fetch')
    else:
        run(f'git clone {REPO_URL} {site_dir}')
    current_commit = local('git log -n 1 --format=%H', capture=True)
    run(f'cd {site_dir} && git reset --hard {current_commit}')


def _npm_install(site_dir):
    run(f'cd {site_dir} && npm install')


def _npm_update(site_dir):
    run(f'cd {site_dir} && npm update')


def _build(site_dir):
    run(f'cd {site_dir} && npm run build')
