.DEFAULT_GOAL := help

.PHONY: help compile compile-watch server dev

clean: ## cleans js output
	@echo 'cleaning up dist'
	@rm -rf ./dist/js/*
	@rm -rf ./dist/src/*
	@echo 'done'

compile: clean ## compiles the ts code
	@echo 'compile start'
	@time ./node_modules/.bin/tsc
	@echo 'done'

copy-src: ## copies src folder to dist, to be used for souce maps
	@cp -R ./src ./dist/

copy-deps: ## copies dependency files to dist 
	@cp -R ./node_modules/fp-ts/es6 ./dist/js/fp-ts

post-process-index: ## post-processes generated index file
	@sed -i '' -e 's/fp-ts/\.\/fp-ts/g' ./dist/js/index.js

post-process-generated: post-process-index ## post-processes generated output only
	@sed -E -i '' '/.*\.js.*/! s/.*[from |Import\(|import\(]['\''"]\.{1,2}(\/[-\.A-Za-z]*)+/&\.js/g' ./dist/js/index.js

post-process-js: ## post-processes all js output
	@find ./dist/js -type f -name '*.js' -exec sed -E -i '' '/.*\.js.*/! s/.*[from |Import\(|import\(]['\''"]\.{1,2}(\/[-\.A-Za-z]*)+/&\.js/g' {} \;

post-process: post-process-index post-process-js

build: compile copy-deps post-process ## builds the app

watch: ## starts watcher to compile on file changes
	$(MAKE) clean
	$(MAKE) copy-deps
	$(MAKE) copy-src
	$(MAKE) post-process-js
	./node_modules/.bin/tsc-watch --onSuccess "$(MAKE) post-process-generated" 

server: ## starts local server
	cd ./dist && python -m SimpleHTTPServer

dev: watch server ## !!!Important run with -j2 option!!! starts file watcher and local dev server

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
