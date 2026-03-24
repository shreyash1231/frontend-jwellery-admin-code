# #!/usr/bin/env bash
# set -euo pipefail

# # Local variables
# PEM_PATH="/home/ajaysingh/Desktop/On going Projects/Student_Tracking_App/super-admin/fetchdelivery.pem"
# IMAGE_NAME="mrajweb/student_tracking_superadmin:latest"
# REMOTE_USER="ubuntu"
# REMOTE_HOST="44.194.125.80"
# REMOTE_DIR="deployments/student_tracking_superadmin"

# echo "Creating the docker build"
# #sudo docker build -t "${IMAGE_NAME}" .

# echo "Pushing the build to Docker registry"
# #sudo docker push "${IMAGE_NAME}"

# echo "Connecting to the server"
# ssh -tt -i "${PEM_PATH}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
#   set -euo pipefail
#   echo "Moving to project directory"
#   cd "${REMOTE_DIR}"

#   echo "Running the script file on server"
#   ./deploy.sh
# EOF

# echo "Done."
