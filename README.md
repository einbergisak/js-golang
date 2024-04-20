# How to run
-git clone https://github.com/einbergisak/js-golang.git

-Checkout to branch “master”

(To install ANTLR4, it is necessary to install an older version of node as seen below, before doing so, installing nvm is necessary https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)

-nvm install 12.22.7 (Note: any version in the 12v to 14v range should work. We also tested v14.16.1 which worked)

-nvm use 12 (To use installed version)

-npm install

-cd src/golang
node goVm.js

To run these test cases, just run node goVm.js to see the output in the terminal. It is possible to create more custom test cases by using the function test() in the desire testcase, see the bottom of the file goVm.js.
