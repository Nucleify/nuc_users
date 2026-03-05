<?php

if (!defined('PEST_RUNNING')) {
    return;
}

require_once __DIR__ . '/TestGroups.php';
require_once __DIR__ . '/TestUses.php';

$userData = require_once __DIR__ . '/TestConstants.php';
$updatedUserData = require_once __DIR__ . '/TestConstants.php';
$changePasswordData = require_once __DIR__ . '/TestConstants.php';
