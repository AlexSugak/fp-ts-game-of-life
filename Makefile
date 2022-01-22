.DEFAULT_GOAL := help

.PHONY: help compile compile-watch server dev

compile: ## compiles the ts code
	@echo 'compile start'
	time ./node_modules/.bin/tsc
	@echo 'done'

compile-watch: ## starts watcher to compile on file changes
	./node_modules/.bin/tsc-watch

server: ## starts local server
	cd ./dist && python -m SimpleHTTPServer

dev: compile-watch server ## !!!Important run with -j2 option!!! starts file watcher and local dev server

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
