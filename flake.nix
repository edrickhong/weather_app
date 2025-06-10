{
  description = "React + TypeScript + Tailwind Dev Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            yarn
            tailwindcss
	    sqlite
	    python3
	    pkg-config
	    python3Packages.setuptools
	    python3Packages.pip
	    gcc
          ];

          shellHook = ''
            echo "Dev shell ready. Run: yarn install && yarn dev"
          '';
        };
      });
}

