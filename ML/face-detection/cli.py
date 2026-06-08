import argparse
from app import register_user, predict_user

def main():
    parser = argparse.ArgumentParser(description="Face Detection & Recognition CLI")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Register command
    register_parser = subparsers.add_parser("register", help="Register a new face")
    register_parser.add_argument("--image", required=True, help="Path to the image file")
    register_parser.add_argument("--name", required=True, help="Name of the person")

    # Predict command
    predict_parser = subparsers.add_parser("predict", help="Predict face from image")
    predict_parser.add_argument("--image", required=True, help="Path to the image file")

    args = parser.parse_args()

    if args.command == "register":
        register_user(args.image, args.name)
    elif args.command == "predict":
        predict_user(args.image)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()