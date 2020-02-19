#include <pthread.h>
#include <sys/types.h>
#include <unistd.h>

#include "fastcgi/fcgiapp.h"

using namespace std;

#define THREAD_COUNT 20

static int counts[THREAD_COUNT];

static int accept_sock = -1;

static void *doit(void *a)
{
    int rc, i, thread_id = (int)(long)a;
    pid_t pid = getpid();
    FCGX_Request request;
    char *server_name;

    FCGX_InitRequest(&request, accept_sock, 0);

    for (;;)
    {
        static pthread_mutex_t accept_mutex = PTHREAD_MUTEX_INITIALIZER;
        static pthread_mutex_t counts_mutex = PTHREAD_MUTEX_INITIALIZER;

        /* Some platforms require accept() serialization, some don't.. */
        pthread_mutex_lock(&accept_mutex);
        rc = FCGX_Accept_r(&request);
        pthread_mutex_unlock(&accept_mutex);

        if (rc < 0)
            break;

        server_name = FCGX_GetParam("SERVER_NAME", request.envp);

        FCGX_FPrintF(request.out,
            "Content-type: text/html\r\n"
            "\r\n"
            "<title>FastCGI Hello! (multi-threaded C, fcgiapp library)</title>"
            "<h1>FastCGI Hello! (multi-threaded C, fcgiapp library)</h1>"
            "Thread %d, Process %ld<p>"
            "Request counts for %d threads running on host <i>%s</i><p><code>",
            thread_id, pid, THREAD_COUNT, server_name ? server_name : "?");

        //sleep(2);

        pthread_mutex_lock(&counts_mutex);
        ++counts[thread_id];
        for (i = 0; i < THREAD_COUNT; i++)
            FCGX_FPrintF(request.out, "%5d " , counts[i]);
        pthread_mutex_unlock(&counts_mutex);

        FCGX_Finish_r(&request);
    }

    return NULL;
}

int main(void)
{
    int i;
    pthread_t id[THREAD_COUNT];

    FCGX_Init();
    accept_sock = FCGX_OpenSocket(":5050", 20);

    for (i = 1; i < THREAD_COUNT; i++)
        pthread_create(&id[i], NULL, doit, (void *)i);

    doit( 0 );

    return 0;
}
