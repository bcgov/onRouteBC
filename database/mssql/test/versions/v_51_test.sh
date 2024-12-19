#!/bin/bash

# Retrieve arguments
source ${SCRIPT_DIR}/utility/getopt.sh
USAGE="-u USER -p PASS -s SERVER -d DATABASE"
parse_options "${USAGE}" ${@}

# All database tests for database version 51 are run from this shell script.
# TESTS_DIR variable set by the calling test-runner script.

TEST_51_1_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_51_1_test.sql | xargs)
if [[ $TEST_51_1_RESULT -eq 4 ]]; then
    echo "Test 51.1 passed: ORIGIN_ID column created successfully."
else
    echo "******** Test 51.1 failed: ORIGIN_ID column not created successfully."
fi

TEST_51_2_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_51_2_test.sql | xargs)
if [[ $TEST_51_2_RESULT -eq 1 ]]; then
    echo "Test 51.2 passed: IS_PRIMARY_DRAFT column created successfully."
else
    echo "******** Test 51.2 failed: IS_PRIMARY_DRAFT column not created successfully."
fi

TEST_51_3_RESULT=$(/opt/mssql-tools/bin/sqlcmd -U ${USER} -P "${PASS}" -S ${SERVER} -v DB_NAME=${DATABASE} -h -1 -i ${TESTS_DIR}/v_51_3_test.sql | xargs)
if [[ $TEST_51_2_RESULT -eq 1 ]]; then
    echo "Test 51.3 passed: Initial policy configuration inserted correctly."
else
    echo "******** Test 51.3 failed: Initial policy configuration not inserted correctly."
fi
