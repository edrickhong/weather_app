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
            nodejs_latest
            yarn
            tailwindcss
          ];

          shellHook = ''
            echo "Dev shell ready. Run: yarn install && yarn dev"
          '';
        };
      });
}

